import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';
import { animate, type AnimationOptions, type DOMKeyframesDefinition } from 'motion';
import { uid } from './internal/a11y';
import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert, X, icon } from './internal/icons';
import { prefersReducedMotion } from './internal/motion';
import styles from './toast.css?inline';

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPriority = 'low' | 'high';
export type ToastSwipeDirection = 'up' | 'down' | 'left' | 'right';

export interface ToastAction {
  label: string;
  onClick?: () => void;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  type?: ToastType;
  /** Milliseconds until the toast dismisses itself. `0` keeps it open until closed. Defaults to 5000, or 0 when `loading`. */
  timeout?: number;
  actions?: ToastAction[];
  /** `high` is announced assertively (`role="alert"`). */
  priority?: ToastPriority;
  /** Runs once the toast has been removed. */
  onClose?: () => void;
}

export interface ToastItem extends Omit<ToastOptions, 'timeout' | 'type' | 'priority'> {
  id: string;
  type: ToastType;
  priority: ToastPriority;
  /** Set while the exit animation runs; the toast is removed afterwards. */
  closing: boolean;
}

export type ToastContent = string | Omit<ToastOptions, 'type'>;

export interface ToastPromiseOptions<T> {
  loading: ToastContent;
  success: ToastContent | ((value: T) => ToastContent);
  error: ToastContent | ((error: unknown) => ToastContent);
}

interface ToastLayout {
  index: number;
  y: number;
  scale: number;
  behind: boolean;
  hidden: boolean;
  swipe: ToastSwipeDirection;
}

const DEFAULT_TIMEOUT = 5000;
const GAP = 12;
const PEEK = 12;

const glyphs: Partial<Record<ToastType, typeof CircleCheck>> = {
  success: CircleCheck,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
  loading: LoaderCircle,
};

const spring = (): AnimationOptions => (prefersReducedMotion() ? { duration: 0 } : { type: 'spring', visualDuration: 0.4, bounce: 0.18 });

const resolve = <V,>(content: ToastContent | ((value: V) => ToastContent), value?: V): Omit<ToastOptions, 'type'> => {
  const next = typeof content === 'function' ? content(value as V) : content;
  return typeof next === 'string' ? { title: next } : next;
};

const isControl = (node: EventTarget) => node instanceof HTMLButtonElement || node instanceof HTMLAnchorElement || node instanceof HTMLInputElement;

/**
 * Global store for toasts. Toasts queue until a `<taqwa-toast-region>` is connected, and only the first connected
 * region renders them. Timers run only while a region is mounted, the page is visible and no region is hovered or focused.
 */
export class ToastManager {
  #items: ToastItem[] = [];
  #timers = new Map<string, { handle?: ReturnType<typeof setTimeout>; remaining: number; started: number }>();
  #region?: TaqwaToastRegion;
  #holders = new Set<TaqwaToastRegion>();
  #onVisibility = () => this.#sync();

  /** Shows a toast and returns its id. */
  add(options: ToastOptions = {}): string {
    const id = uid('taqwa-toast');
    const timeout = options.timeout ?? (options.type === 'loading' ? 0 : DEFAULT_TIMEOUT);
    const { timeout: _timeout, ...rest } = options;
    this.#items = [{ ...rest, id, type: rest.type ?? 'default', priority: rest.priority ?? 'low', closing: false }, ...this.#items];
    this.#timers.set(id, { remaining: timeout, started: 0 });
    this.#changed();
    return id;
  }

  /** Changes a toast in place. Passing `timeout` restarts its timer. */
  update(id: string, options: Partial<ToastOptions> = {}) {
    const { timeout, ...rest } = options;
    this.#items = this.#items.map((item) => (item.id === id ? { ...item, ...rest } : item));
    const timer = this.#timers.get(id);
    if (timer && timeout !== undefined) {
      clearTimeout(timer.handle);
      timer.handle = undefined;
      timer.remaining = timeout;
    }
    this.#changed();
  }

  /** Dismisses a toast with its exit animation. */
  close(id: string) {
    const item = this.#items.find((i) => i.id === id);
    if (!item || item.closing) return;
    clearTimeout(this.#timers.get(id)?.handle);
    this.#timers.delete(id);
    if (!this.#region) return this.remove(id);
    this.#items = this.#items.map((i) => (i.id === id ? { ...i, closing: true } : i));
    this.#changed();
  }

  /** Shows a loading toast that becomes success or error when the promise settles. Returns the same promise. */
  promise<T>(promise: Promise<T>, messages: ToastPromiseOptions<T>): Promise<T> {
    const id = this.add({ ...resolve(messages.loading), type: 'loading' });
    promise.then(
      (value) => this.update(id, { type: 'success', timeout: DEFAULT_TIMEOUT, ...resolve(messages.success, value) }),
      (error) => this.update(id, { type: 'error', timeout: DEFAULT_TIMEOUT, ...resolve(messages.error, error) }),
    );
    return promise;
  }

  /** Removes a toast once its exit animation has finished. Called by the region. */
  remove(id: string) {
    const item = this.#items.find((i) => i.id === id);
    if (!item) return;
    this.#items = this.#items.filter((i) => i.id !== id);
    this.#timers.delete(id);
    item.onClose?.();
    this.#region?.requestUpdate();
  }

  /** Toasts to render, newest first. Only the owning region gets them. */
  itemsFor(region: TaqwaToastRegion) {
    return this.#region === region ? this.#items : [];
  }

  /** Pauses auto-dismiss while the owning region is hovered or focused. */
  hold(region: TaqwaToastRegion, held: boolean) {
    if (this.#region !== region) return;
    if (held) this.#holders.add(region);
    else this.#holders.delete(region);
    this.#sync();
  }

  attach(region: TaqwaToastRegion) {
    if (this.#region) return;
    this.#region = region;
    document.addEventListener('visibilitychange', this.#onVisibility);
    this.#changed();
  }

  detach(region: TaqwaToastRegion) {
    if (this.#region !== region) return;
    this.#region = undefined;
    this.#holders.delete(region);
    document.removeEventListener('visibilitychange', this.#onVisibility);
    this.#sync();
  }

  #changed() {
    this.#sync();
    this.#region?.requestUpdate();
  }

  #sync() {
    const hidden = typeof document !== 'undefined' && document.hidden;
    const run = !!this.#region && this.#holders.size === 0 && !hidden;
    for (const [id, timer] of this.#timers) {
      if (run && !timer.handle && timer.remaining > 0) {
        timer.started = Date.now();
        timer.handle = setTimeout(() => this.close(id), timer.remaining);
      } else if (!run && timer.handle) {
        clearTimeout(timer.handle);
        timer.handle = undefined;
        timer.remaining -= Date.now() - timer.started;
      }
    }
  }
}

/** The global toast manager. Import it anywhere; it is safe to call before a region is mounted. */
export const toast = new ToastManager();

/**
 * Renders toasts from the `toast` manager. Place one in the page (e.g. at the end of `<body>`); the first connected
 * region shows every toast. Extra toasts stack behind the newest one and fan out on hover or focus.
 *
 * @summary Live region that shows notifications from the `toast` manager.
 * @slot - None. Toasts are rendered from the manager.
 * @csspart base - Fixed viewport that holds the stack. Focus target for F6.
 * @csspart stack - Positioned container of the toasts.
 */
@customElement('taqwa-toast-region')
export class TaqwaToastRegion extends LitElement {
  static styles = unsafeCSS(styles);

  /** Toasts visible in the collapsed stack. Older ones stay hidden behind it until it expands. */
  @property({ type: Number }) limit = 3;
  /** Swipe-to-dismiss direction. `auto` is down on small screens and right from 48rem. */
  @property({ attribute: 'swipe-direction' }) swipeDirection: ToastSwipeDirection | 'auto' = 'auto';
  /** Accessible name of the notifications landmark. */
  @property() label = 'Notifications';

  @query('.taqwa-toast-region-viewport') private viewport!: HTMLElement;
  @query('.taqwa-toast-region-stack') private stack!: HTMLElement;

  #hovered = false;
  #focused = false;
  #expanded = false;
  #returnFocus: HTMLElement | null = null;
  #resizeObserver?: ResizeObserver;

  render() {
    return html`<section
      part="base"
      class="taqwa-toast-region-viewport"
      aria-label=${this.label}
      tabindex="-1"
      @pointerenter=${() => this.#hover(true)}
      @pointerleave=${() => this.#hover(false)}
      @focusin=${() => this.#focus(true)}
      @focusout=${this.#onFocusOut}
    >
      <div part="stack" class="taqwa-toast-region-stack" aria-live="polite" @toast-exited=${this.#onExited}>
        ${repeat(toast.itemsFor(this), (item) => item.id, (item) => html`<taqwa-toast .item=${item}></taqwa-toast>`)}
      </div>
    </section>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.#resizeObserver ??= new ResizeObserver(() => this.#layout());
    document.addEventListener('keydown', this.#onKey);
    toast.attach(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.#onKey);
    this.#resizeObserver?.disconnect();
    this.#expanded = false;
    toast.detach(this);
  }

  updated() {
    this.#focused &&= this.matches(':focus-within');
    this.#expand();
    this.#layout();
    this.#resizeObserver?.disconnect();
    this.renderRoot.querySelectorAll('taqwa-toast').forEach((el) => this.#resizeObserver?.observe(el));
  }

  /** Positions every toast: collapsed as a peeking deck, expanded as a list. Heights are measured, so this runs after render. */
  #layout() {
    if (!this.stack) return;
    const toasts = [...this.renderRoot.querySelectorAll<TaqwaToast>('taqwa-toast')].filter((el) => !el.item.closing);
    const expanded = this.#expanded;
    const swipe = this.#swipe();
    let stacked = 0;
    toasts.forEach((el, index) => {
      el.place({
        index,
        y: expanded ? -(stacked + GAP * index) : -PEEK * index,
        scale: expanded ? 1 : Math.max(0, 1 - index * 0.05),
        behind: !expanded && index > 0,
        hidden: !expanded && index >= this.limit,
        swipe,
      });
      stacked += el.offsetHeight;
    });
    const height = expanded ? stacked + GAP * Math.max(0, toasts.length - 1) : (toasts[0]?.offsetHeight ?? 0);
    this.stack.style.height = `${height}px`;
  }

  #swipe(): ToastSwipeDirection {
    if (this.swipeDirection !== 'auto') return this.swipeDirection;
    return matchMedia('(min-width: 48rem)').matches ? 'right' : 'down';
  }

  #hover(on: boolean) {
    this.#hovered = on;
    this.#expand();
  }

  #focus(on: boolean) {
    this.#focused = on;
    this.#expand();
  }

  #expand() {
    const expanded = this.#hovered || this.#focused;
    if (expanded === this.#expanded) return;
    this.#expanded = expanded;
    toast.hold(this, expanded);
    this.#layout();
  }

  #onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && this.renderRoot.contains(next)) return;
    this.#focus(false);
  };

  #onExited = (event: Event) => toast.remove((event as CustomEvent<string>).detail);

  /** F6 moves focus into the notifications region and back to where it was. */
  #onKey = (event: KeyboardEvent) => {
    if (event.key !== 'F6') return;
    event.preventDefault();
    if (this.matches(':focus-within')) {
      this.#returnFocus?.focus();
      this.#returnFocus = null;
    } else {
      this.#returnFocus = document.activeElement as HTMLElement | null;
      this.viewport.focus();
    }
  };
}

/**
 * A single toast card. Rendered by `<taqwa-toast-region>`; create toasts with the `toast` manager instead.
 * Animates itself into and out of the stack and handles swipe-to-dismiss.
 *
 * @summary One notification card. Internal to `taqwa-toast-region`.
 * @fires toast-exited - Internal. Fired after the exit animation, `detail: id`.
 * @slot - None.
 * @csspart base - Card wrapper, `role="alert"` for high priority.
 * @csspart content - Padded row with icon, text and close button. Hidden while stacked behind.
 * @csspart icon - Type icon.
 * @csspart title - Title text.
 * @csspart description - Description text.
 * @csspart actions - Row of action buttons.
 * @csspart action - An action button.
 * @csspart close - Dismiss button.
 */
@customElement('taqwa-toast')
export class TaqwaToast extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ attribute: false }) item!: ToastItem;

  #layout?: ToastLayout;
  #placed = false;
  #exiting = false;
  #drag?: { x: number; y: number; t: number; moved: number };
  #spinner?: ReturnType<typeof animate>;

  render() {
    const { item } = this;
    const glyph = glyphs[item.type];
    return html`<article
      part="base"
      class="taqwa-toast"
      data-type=${item.type}
      role=${ifDefined(item.priority === 'high' ? 'alert' : undefined)}
      @pointerdown=${this.#onDown}
      @pointermove=${this.#onMove}
      @pointerup=${this.#onUp}
      @pointercancel=${this.#onUp}
    >
      <div part="content" class="taqwa-toast-content">
        ${glyph ? html`<span part="icon" class="taqwa-toast-icon">${icon(glyph, '1.25rem')}</span>` : nothing}
        <div class="taqwa-toast-text">
          ${item.title ? html`<p part="title" class="taqwa-toast-title">${item.title}</p>` : nothing}
          ${item.description ? html`<p part="description" class="taqwa-toast-description">${item.description}</p>` : nothing}
          ${item.actions?.length
            ? html`<div part="actions" class="taqwa-toast-actions">
                ${item.actions.map(
                  (action) =>
                    html`<button part="action" class="taqwa-toast-action" type="button" @click=${() => action.onClick?.()}>
                      ${action.label}
                    </button>`,
                )}
              </div>`
            : nothing}
        </div>
        <button
          part="close"
          class="taqwa-toast-close"
          type="button"
          aria-label="Dismiss notification"
          @click=${() => toast.close(item.id)}
        >
          ${icon(X, '1rem')}
        </button>
      </div>
    </article>`;
  }

  updated() {
    if (this.item.closing) return this.#exit();
    const loading = this.item.type === 'loading';
    const el = this.renderRoot.querySelector<HTMLElement>('.taqwa-toast-icon');
    if (loading && !this.#spinner && !prefersReducedMotion()) {
      if (el) this.#spinner = animate(el, { rotate: [0, 360] }, { duration: 1, ease: 'linear', repeat: Infinity });
    } else if (!loading && this.#spinner) {
      this.#spinner.stop();
      this.#spinner = undefined;
      // Lit reuses the icon span for the next glyph, so undo the spinner's leftover angle.
      if (el) animate(el, { rotate: 0 }, { duration: 0 });
    }
  }

  /** Moves the toast to its slot in the stack. The first call also plays the enter animation. */
  place(layout: ToastLayout) {
    this.#layout = layout;
    this.inert = layout.hidden;
    this.toggleAttribute('data-behind', layout.behind);
    this.style.zIndex = String(1000 - layout.index);
    if (this.#exiting || this.item.closing) return;
    // Fade through `--_fade`, not `opacity`: opacity < 1 on an ancestor switches off the card's backdrop blur.
    const fade = layout.hidden ? 0 : 1;
    if (this.#placed) {
      animate(this, { x: 0, y: layout.y, scale: layout.scale, '--_fade': fade } as DOMKeyframesDefinition, spring());
      return;
    }
    this.#placed = true;
    this.style.setProperty('--_fade', '0');
    animate(
      this,
      { '--_fade': [0, fade], y: [layout.y + 24, layout.y], scale: [0.96, layout.scale] } as DOMKeyframesDefinition,
      spring(),
    );
  }

  #exit() {
    if (this.#exiting) return;
    this.#exiting = true;
    animate(
      this,
      { '--_fade': 0 } as DOMKeyframesDefinition,
      prefersReducedMotion() ? { duration: 0 } : { duration: 0.4, ease: 'easeInOut' },
    ).then(() => this.dispatchEvent(new CustomEvent('toast-exited', { detail: this.item.id, bubbles: true })));
  }

  #onDown = (event: PointerEvent) => {
    if (event.button !== 0 || this.#drag || event.composedPath().some(isControl)) return;
    this.#drag = { x: event.clientX, y: event.clientY, t: event.timeStamp, moved: 0 };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  /** Drags along the swipe direction; movement against it is resisted. */
  #onMove = (event: PointerEvent) => {
    const drag = this.#drag;
    if (!drag || !this.#layout) return;
    const dir = this.#layout.swipe;
    const horizontal = dir === 'left' || dir === 'right';
    const sign = dir === 'right' || dir === 'down' ? 1 : -1;
    const along = (horizontal ? event.clientX - drag.x : event.clientY - drag.y) * sign;
    drag.moved = (along >= 0 ? along : along * 0.2) * sign;
    animate(this, { x: horizontal ? drag.moved : 0, y: this.#layout.y + (horizontal ? 0 : drag.moved) }, { duration: 0 });
  };

  #onUp = (event: PointerEvent) => {
    const drag = this.#drag;
    this.#drag = undefined;
    if (!drag || !this.#layout) return;
    const distance = Math.abs(drag.moved);
    const speed = distance / Math.max(1, event.timeStamp - drag.t);
    if (distance > 48 || (speed > 0.6 && distance > 16)) toast.close(this.item.id);
    else this.place(this.#layout);
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-toast-region': TaqwaToastRegion;
    'taqwa-toast': TaqwaToast;
  }
}
