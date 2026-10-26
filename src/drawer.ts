import { unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { animate, type DOMKeyframesDefinition } from 'motion';
import { prefersReducedMotion } from './internal/motion';
import { TaqwaDialog } from './dialog';
import styles from './drawer.css?inline';

export type DrawerSide = 'bottom' | 'top' | 'left' | 'right';
/** A fraction of the viewport (`0.5`), pixels (`240` or `'240px'`) or rem (`'15rem'`). */
export type DrawerSnapPoint = number | string;

/** A resting position: `offset` is how far the panel is pushed off-screen along the closing axis, in px. */
interface Stop {
  offset: number;
  snap?: DrawerSnapPoint;
}

interface Drag {
  id: number;
  size: number;
  min: number;
  from: number;
  start: number;
  last: number;
  time: number;
  velocity: number;
  offset: number;
  swiping: boolean;
}

const spring = { type: 'spring', visualDuration: 0.38, bounce: 0.12 } as const;
const nearest = (stops: Stop[], value: number) =>
  stops.reduce((best, stop) => (Math.abs(stop.offset - value) < Math.abs(best.offset - value) ? stop : best), stops[0]);

/**
 * A dialog that slides in from an edge. Drag the panel toward that edge to dismiss it. On top and bottom drawers, drag
 * between `snapPoints` to resize it.
 *
 * @summary Edge-anchored dialog with swipe-to-dismiss and snap points.
 * @fires open-change - Fired before the drawer opens or closes. `detail`: `{ open, reason }`. Cancelable. A swipe closes with reason `swipe-dismiss`.
 * @fires snap-point-change - Fired when a swipe settles on another snap point. `detail`: `{ snapPoint }`. Cancelable.
 * @slot trigger - Element that opens the drawer when clicked.
 * @slot title - Heading of the drawer. Labels the drawer.
 * @slot description - Supporting text. Describes the drawer.
 * @slot - Drawer content.
 * @slot close - Element that closes the drawer when clicked.
 * @csspart dialog - The native `<dialog>` element.
 * @csspart backdrop - Frosted scrim behind the panel.
 * @csspart popup - The glass panel.
 * @csspart handle - Drag handle on top and bottom drawers.
 * @csspart scroll - Scrollable body of the panel.
 * @csspart title - Heading wrapper.
 * @csspart description - Description wrapper.
 * @csspart content - Default slot wrapper.
 * @csspart actions - Footer wrapper of the `close` slot.
 * @csspart close - Corner close button.
 */
@customElement('taqwa-drawer')
export class TaqwaDrawer extends TaqwaDialog {
  static styles = unsafeCSS(styles);

  /** Edge the drawer slides in from. A swipe toward that edge dismisses it. */
  @property({ reflect: true }) side: DrawerSide = 'bottom';
  /** Resting heights of a top or bottom drawer. The drawer snaps to these instead of its content height. */
  @property({ attribute: false }) snapPoints: DrawerSnapPoint[] = [];
  /** The active snap point. Defaults to the first of `snapPoints`. */
  @property({ attribute: 'snap-point' }) snapPoint?: DrawerSnapPoint;

  #anim?: ReturnType<typeof animate>;
  #drag?: Drag;
  #settled = false;
  #unbindPointer?: VoidFunction;

  get #vertical() {
    return this.side === 'bottom' || this.side === 'top';
  }

  /** Maps the drawer's closing direction to +1 (down or right) or -1 (up or left). */
  get #sign() {
    return this.side === 'bottom' || this.side === 'right' ? 1 : -1;
  }

  protected firstUpdated() {
    super.firstUpdated();
    this.#bindPointer();
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this.#bindPointer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#unbindPointer?.();
    this.#unbindPointer = undefined;
  }

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    if (changed.has('snapPoint') && this.#settled && !this.#drag) {
      this.#animate(this.#offset(), this.#rest(this.#size()));
    }
  }

  protected enter() {
    const size = this.#size();
    this.#place(size);
    return Promise.all([
      this.fade(1),
      this.#animate(size, this.#rest(size)).then(() => {
        this.#settled = true;
      }),
    ]);
  }

  protected exit() {
    this.#settled = false;
    return Promise.all([this.fade(0), this.#animate(this.#offset(), this.#size())]);
  }

  #bindPointer() {
    this.#unbindPointer?.();
    const popup = this.popup;
    popup.addEventListener('pointerdown', this.#onDown);
    popup.addEventListener('pointermove', this.#onMove);
    popup.addEventListener('pointerup', this.#onUp);
    popup.addEventListener('pointercancel', this.#onUp);
    this.#unbindPointer = () => {
      popup.removeEventListener('pointerdown', this.#onDown);
      popup.removeEventListener('pointermove', this.#onMove);
      popup.removeEventListener('pointerup', this.#onUp);
      popup.removeEventListener('pointercancel', this.#onUp);
    };
  }

  #onDown = (event: PointerEvent) => {
    if (event.button !== 0 || !this.open) return;
    this.#anim?.stop();
    const size = this.#size();
    const offset = this.#offset();
    const pointer = this.#pointer(event);
    this.#drag = {
      id: event.pointerId,
      size,
      min: this.#stops(size)[0].offset,
      from: offset,
      start: pointer,
      last: pointer,
      time: event.timeStamp,
      velocity: 0,
      offset,
      swiping: false,
    };
  };

  #onMove = (event: PointerEvent) => {
    const drag = this.#drag;
    if (!drag || event.pointerId !== drag.id) return;
    const pointer = this.#pointer(event);
    const delta = pointer - drag.start;

    if (!drag.swiping) {
      if (Math.abs(delta) < 6) return;
      // Hand the gesture back to the content when it can scroll that way, or when the panel is already fully open.
      if ((delta > 0 && this.scroller.scrollTop > 0) || (delta < 0 && drag.from <= drag.min)) {
        this.#drag = undefined;
        return;
      }
      drag.swiping = true;
      this.popup.setPointerCapture(event.pointerId);
    }

    const offset = Math.min(drag.size, Math.max(drag.min, drag.from + delta));
    if (event.timeStamp > drag.time) {
      drag.velocity = (pointer - drag.last) / (event.timeStamp - drag.time);
      drag.last = pointer;
      drag.time = event.timeStamp;
    }
    drag.offset = offset;
    this.#place(offset);
  };

  #onUp = (event: PointerEvent) => {
    const drag = this.#drag;
    if (!drag || event.pointerId !== drag.id) return;
    this.#drag = undefined;
    if (!drag.swiping) return;

    const stops = this.#stops(drag.size);
    const projected = drag.offset + drag.velocity * 180;
    let target = nearest(stops, projected);
    if (target.offset >= drag.size) {
      if (this.request(false, 'swipe-dismiss')) return;
      target = nearest(stops.filter((stop) => stop.offset < drag.size), projected);
    }

    let to = target.offset;
    if (target.snap !== undefined && !this.#changeSnap(target.snap)) to = this.#rest(drag.size);
    this.#animate(drag.offset, to);
  };

  #changeSnap(snap: DrawerSnapPoint) {
    if (String(snap) === String(this.snapPoint ?? this.snapPoints[0])) return true;
    const event = new CustomEvent('snap-point-change', {
      detail: { snapPoint: snap },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
    if (event.defaultPrevented) return false;
    this.snapPoint = snap;
    return true;
  }

  #stops(size: number): Stop[] {
    const stops: Stop[] = this.snapPoints.length
      ? this.snapPoints.map((snap) => ({ offset: size - Math.min(this.#px(snap), size), snap }))
      : [{ offset: 0 }];
    stops.push({ offset: size });
    return stops.sort((a, b) => a.offset - b.offset);
  }

  #rest(size: number) {
    if (!this.snapPoints.length) return 0;
    const snap = String(this.snapPoint ?? this.snapPoints[0]);
    return this.#stops(size).find((stop) => stop.snap !== undefined && String(stop.snap) === snap)?.offset ?? 0;
  }

  #px(snap: DrawerSnapPoint) {
    const value = String(snap).trim();
    if (value.endsWith('rem')) return parseFloat(value) * parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (value.endsWith('px')) return parseFloat(value);
    const fraction = parseFloat(value);
    return fraction <= 1 ? fraction * (this.#vertical ? innerHeight : innerWidth) : fraction;
  }

  #size() {
    return this.#vertical ? this.popup.offsetHeight : this.popup.offsetWidth;
  }

  /** Pointer position along the closing direction, so that a move toward the closed edge always increases it. */
  #pointer(event: PointerEvent) {
    return this.#sign * (this.#vertical ? event.clientY : event.clientX);
  }

  /** How far the panel is currently pushed off-screen, read back from the rendered transform. */
  #offset() {
    const transform = getComputedStyle(this.popup).transform;
    const matrix = transform === 'none' ? new DOMMatrix() : new DOMMatrix(transform);
    return this.#sign * (this.#vertical ? matrix.m42 : matrix.m41);
  }

  #place(offset: number) {
    this.popup.style.transform = this.#transform(offset);
  }

  #transform(offset: number) {
    return `${this.#vertical ? 'translateY' : 'translateX'}(${this.#sign * offset}px)`;
  }

  #animate(from: number, to: number) {
    this.#anim?.stop();
    const key = this.#vertical ? 'y' : 'x';
    const keyframes = { [key]: [this.#sign * from, this.#sign * to] } as DOMKeyframesDefinition;
    this.#anim = animate(this.popup, keyframes, prefersReducedMotion() ? { duration: 0 } : spring);
    return this.#anim;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-drawer': TaqwaDrawer;
  }
}
