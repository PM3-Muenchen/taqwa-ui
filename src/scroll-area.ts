import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { animate } from 'motion';
import { isRtl } from './internal/a11y';
import { prefersReducedMotion } from './internal/motion';
import styles from './scroll-area.css?inline';

const HIDE_DELAY = 1000;
const MIN_THUMB = 24;

type Axis = 'x' | 'y';

/**
 * A native scroll container with custom, glass-like scrollbars. Native scrolling and keyboard support are kept;
 * on touch-only devices the platform's own scrollbars are used. Give the element a height (or width) to scroll.
 *
 * @summary Scrollable container with custom vertical and horizontal scrollbars.
 * @slot - Scrollable content.
 * @csspart base - Positioned wrapper.
 * @csspart viewport - The native scroll container, focusable while it can scroll.
 * @csspart content - Wrapper around the slotted content.
 * @csspart scrollbar - Vertical or horizontal scrollbar, `data-orientation` tells them apart.
 * @csspart thumb - Draggable thumb inside a scrollbar.
 */
@customElement('taqwa-scroll-area')
export class TaqwaScrollArea extends LitElement {
  static styles = unsafeCSS(styles);

  @query('.taqwa-scroll-area-viewport') private viewport!: HTMLElement;
  @query('.taqwa-scroll-area-content') private content!: HTMLElement;
  @query('[data-orientation="vertical"]') private barY!: HTMLElement;
  @query('[data-orientation="horizontal"]') private barX!: HTMLElement;
  @query('[data-orientation="vertical"] .taqwa-scroll-area-thumb') private thumbY!: HTMLElement;
  @query('[data-orientation="horizontal"] .taqwa-scroll-area-thumb') private thumbX!: HTMLElement;

  #hovering = false;
  #scrolling = false;
  #scrollTimer?: ReturnType<typeof setTimeout>;
  #drag?: { axis: Axis; start: number; scroll: number };
  #observer?: ResizeObserver;

  render() {
    return html`<div part="base" class="taqwa-scroll-area">
      <div part="viewport" class="taqwa-scroll-area-viewport" @scroll=${this.#onScroll}>
        <div part="content" class="taqwa-scroll-area-content"><slot></slot></div>
      </div>
      ${this.#bar('vertical')} ${this.#bar('horizontal')}
    </div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this.#bind();
  }

  firstUpdated() {
    this.#bind();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#observer?.disconnect();
    this.removeEventListener('pointerenter', this.#onEnter);
    this.removeEventListener('pointerleave', this.#onLeave);
    clearTimeout(this.#scrollTimer);
  }

  #bind() {
    this.#observer?.disconnect();
    this.#observer = new ResizeObserver(() => this.#sync());
    this.#observer.observe(this.viewport);
    this.#observer.observe(this.content);
    this.addEventListener('pointerenter', this.#onEnter);
    this.addEventListener('pointerleave', this.#onLeave);
    this.#sync();
  }

  #bar(orientation: 'vertical' | 'horizontal') {
    return html`<div
      part="scrollbar"
      class="taqwa-scroll-area-scrollbar"
      data-orientation=${orientation}
      hidden
      @pointerdown=${(event: PointerEvent) => this.#onTrackDown(event, orientation === 'vertical' ? 'y' : 'x')}
    >
      <div
        part="thumb"
        class="taqwa-scroll-area-thumb"
        @pointerdown=${(event: PointerEvent) => this.#onThumbDown(event, orientation === 'vertical' ? 'y' : 'x')}
        @pointermove=${this.#onThumbMove}
        @pointerup=${this.#onThumbUp}
        @pointercancel=${this.#onThumbUp}
      ></div>
    </div>`;
  }

  #onEnter = () => {
    this.#hovering = true;
    this.#sync();
  };

  #onLeave = () => {
    this.#hovering = false;
    this.#sync();
  };

  #onScroll = () => {
    this.#scrolling = true;
    clearTimeout(this.#scrollTimer);
    this.#scrollTimer = setTimeout(() => {
      this.#scrolling = false;
      this.#sync();
    }, HIDE_DELAY);
    this.#sync();
  };

  /** Recomputes overflow, thumb size and position, and which scrollbars are visible. */
  #sync() {
    if (!this.viewport) return;
    const overflowX = this.#measure('x');
    const overflowY = this.#measure('y');
    this.toggleAttribute('data-overflow-x', overflowX);
    this.toggleAttribute('data-overflow-y', overflowY);
    if (overflowX || overflowY) this.viewport.tabIndex = 0;
    else this.viewport.removeAttribute('tabindex');
    const show = this.#hovering || this.#scrolling || !!this.#drag;
    this.#fade(this.barX, show && overflowX);
    this.#fade(this.barY, show && overflowY);
  }

  /** Sizes and positions the thumb for one axis. Returns whether that axis overflows. */
  #measure(axis: Axis) {
    const bar = axis === 'y' ? this.barY : this.barX;
    const v = this.viewport;
    const visible = axis === 'y' ? v.clientHeight : v.clientWidth;
    const total = axis === 'y' ? v.scrollHeight : v.scrollWidth;
    const max = total - visible;
    bar.hidden = max <= 1;
    if (bar.hidden) return false;
    const track = axis === 'y' ? bar.clientHeight : bar.clientWidth;
    const size = Math.max(MIN_THUMB, (track * visible) / total);
    const progress = Math.abs(axis === 'y' ? v.scrollTop : v.scrollLeft) / max;
    const ratio = axis === 'x' && isRtl(this) ? 1 - progress : progress;
    bar.style.setProperty('--thumb-size', `${size}px`);
    bar.style.setProperty('--thumb-offset', `${ratio * (track - size)}px`);
    return true;
  }

  #fade(bar: HTMLElement, visible: boolean) {
    if (bar.hasAttribute('data-visible') === visible) return;
    bar.toggleAttribute('data-visible', visible);
    animate(bar, { opacity: visible ? 1 : 0 }, prefersReducedMotion() ? { duration: 0 } : { duration: visible ? 0.15 : 0.3 });
  }

  #onTrackDown(event: PointerEvent, axis: Axis) {
    const bar = axis === 'y' ? this.barY : this.barX;
    const rect = bar.getBoundingClientRect();
    const thumb = axis === 'y' ? this.thumbY : this.thumbX;
    const len = axis === 'y' ? thumb.offsetHeight : thumb.offsetWidth;
    const pos = axis === 'y' ? event.clientY - rect.top : event.clientX - rect.left;
    const track = axis === 'y' ? rect.height : rect.width;
    this.#scrollToRatio(axis, (pos - len / 2) / (track - len));
  }

  #onThumbDown(event: PointerEvent, axis: Axis) {
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    const v = this.viewport;
    this.#drag = { axis, start: axis === 'y' ? event.clientY : event.clientX, scroll: axis === 'y' ? v.scrollTop : v.scrollLeft };
    this.#sync();
  }

  #onThumbMove = (event: PointerEvent) => {
    if (!this.#drag) return;
    const { axis, start, scroll } = this.#drag;
    const v = this.viewport;
    const delta = (axis === 'y' ? event.clientY : event.clientX) - start;
    const bar = axis === 'y' ? this.barY : this.barX;
    const thumb = axis === 'y' ? this.thumbY : this.thumbX;
    const track = axis === 'y' ? bar.clientHeight : bar.clientWidth;
    const len = axis === 'y' ? thumb.offsetHeight : thumb.offsetWidth;
    const max = (axis === 'y' ? v.scrollHeight - v.clientHeight : v.scrollWidth - v.clientWidth);
    const next = scroll + (delta * max) / (track - len);
    if (axis === 'y') v.scrollTop = next;
    else v.scrollLeft = next;
  };

  #onThumbUp = () => {
    this.#drag = undefined;
    this.#sync();
  };

  /** `ratio` is where the thumb should sit, 0 at the start and 1 at the end of the track. */
  #scrollToRatio(axis: Axis, ratio: number) {
    const v = this.viewport;
    const r = Math.min(1, Math.max(0, ratio));
    if (axis === 'y') {
      v.scrollTop = r * (v.scrollHeight - v.clientHeight);
    } else {
      const max = v.scrollWidth - v.clientWidth;
      v.scrollLeft = isRtl(this) ? -(1 - r) * max : r * max;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-scroll-area': TaqwaScrollArea;
  }
}
