import { html, LitElement, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { animate } from 'motion';
import { icon, X } from './internal/icons';
import { animatePopupIn, animatePopupOut, bindGlassMotion, prefersReducedMotion } from './internal/motion';
import styles from './dialog.css?inline';

export type DialogChangeReason = 'trigger-press' | 'outside-press' | 'escape-key' | 'close-press' | 'swipe-dismiss' | 'imperative-action';
export interface DialogOpenChangeDetail {
  open: boolean;
  reason: DialogChangeReason;
}

/**
 * A modal popup on a frosted glass surface. The `trigger` slot opens it; Escape, the corner close button, `close`-slotted
 * elements and (unless disabled) an outside press close it. Focus moves inside on open and returns to the trigger on close.
 *
 * @summary Modal popup that opens on top of the page.
 * @fires open-change - Fired before the dialog opens or closes. `detail`: `{ open, reason }`. Cancelable.
 * @slot trigger - Element that opens the dialog when clicked.
 * @slot title - Heading of the dialog. Labels the dialog.
 * @slot description - Supporting text. Describes the dialog.
 * @slot - Dialog content.
 * @slot close - Element that closes the dialog when clicked, usually an action button.
 * @csspart dialog - The native `<dialog>` element.
 * @csspart backdrop - Frosted scrim behind the popup.
 * @csspart popup - The glass surface.
 * @csspart handle - Drag handle of a drawer.
 * @csspart scroll - Scrollable body of the popup.
 * @csspart title - Heading wrapper.
 * @csspart description - Description wrapper.
 * @csspart content - Default slot wrapper.
 * @csspart actions - Footer wrapper of the `close` slot.
 * @csspart close - Corner close button.
 */
@customElement('taqwa-dialog')
export class TaqwaDialog extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ type: Boolean, reflect: true }) open = false;
  /** Traps focus, inerts the page behind a backdrop and locks scrolling. `modal="false"` leaves the page interactive. */
  @property({ converter: { fromAttribute: (value: string | null) => value !== 'false' } }) modal = true;
  /** Ignores outside presses. Escape still closes. */
  @property({ type: Boolean, attribute: 'disable-pointer-dismissal' }) disablePointerDismissal = false;

  @state() private slotted: Record<string, boolean> = {};

  #returnFocus: HTMLElement | null = null;
  #scrollLock?: string;
  #unbindMotion?: VoidFunction;

  get #dialog() {
    return this.renderRoot.querySelector('dialog')!;
  }

  protected get popup() {
    return this.renderRoot.querySelector<HTMLElement>('.taqwa-dialog__popup')!;
  }

  protected get backdrop() {
    return this.renderRoot.querySelector<HTMLElement>('.taqwa-dialog__backdrop')!;
  }

  protected get scroller() {
    return this.renderRoot.querySelector<HTMLElement>('.taqwa-dialog__scroll')!;
  }

  /** ARIA role of the native dialog. */
  protected get dialogRole(): string {
    return 'dialog';
  }

  /** Whether an outside press closes the dialog. */
  protected get dismissOnOutsidePress() {
    return !this.disablePointerDismissal;
  }

  /** Opens the dialog. Returns `false` if an `open-change` listener cancelled it. */
  show() {
    return this.request(true, 'imperative-action');
  }

  /** Closes the dialog. Returns `false` if an `open-change` listener cancelled it. */
  close() {
    return this.request(false, 'imperative-action');
  }

  /** Dispatches a cancelable `open-change` and applies the change unless a listener calls `preventDefault()`. */
  protected request(open: boolean, reason: DialogChangeReason) {
    if (open === this.open) return true;
    const event = new CustomEvent<DialogOpenChangeDetail>('open-change', {
      detail: { open, reason },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
    if (event.defaultPrevented) return false;
    this.open = open;
    return true;
  }

  /** Entrance animation, run once the dialog is shown. */
  protected enter(): PromiseLike<unknown> {
    return Promise.all([this.fade(1), animatePopupIn(this.popup)]);
  }

  /** Exit animation. The dialog is closed once it resolves. */
  protected exit(): PromiseLike<unknown> {
    return Promise.all([this.fade(0), animatePopupOut(this.popup)]);
  }

  protected fade(opacity: 0 | 1) {
    return animate(this.backdrop, { opacity: [1 - opacity, opacity] }, prefersReducedMotion() ? { duration: 0 } : { duration: 0.2 });
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) {
      this.#bindMotion();
      if (this.open) void this.#show();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#unbindMotion?.();
    this.#dialog?.close();
    this.#unlockScroll();
  }

  protected firstUpdated() {
    this.#bindMotion();
  }

  protected updated(changed: PropertyValues) {
    if (changed.has('open')) {
      if (this.open) void this.#show();
      else void this.#hide();
    }
    this.syncAria();
  }

  /** Sets ARIA on the native dialog and the slotted trigger. Runs after every update. */
  protected syncAria() {
    const trigger = this.querySelector<HTMLElement>(':scope > [slot="trigger"]');
    trigger?.setAttribute('aria-haspopup', 'dialog');
    trigger?.setAttribute('aria-expanded', String(this.open));
    const title = this.querySelector<HTMLElement>(':scope > [slot="title"]');
    const dialog = this.#dialog;
    if (!dialog) return;
    dialog.ariaLabelledByElements = title ? [title] : null;
    // Text fallback for browsers without ARIA element reflection (Chrome < 135, Firefox < 136).
    dialog.ariaLabel = title?.textContent?.trim() || null;
  }

  render() {
    return html`
      <slot name="trigger" @click=${this.#onTrigger}></slot>
      <dialog
        part="dialog"
        class="taqwa-dialog"
        role=${this.dialogRole}
        @cancel=${this.#onCancel}
        @keydown=${this.#onKeydown}
        @pointerdown=${this.#onPointerDown}
      >
        <div part="backdrop" class="taqwa-dialog__backdrop"></div>
        <div class="taqwa-dialog__viewport">
          <div part="popup" class="taqwa-dialog__popup">
            <div part="handle" class="taqwa-dialog__handle"></div>
            <div part="scroll" class="taqwa-dialog__scroll">
              <header part="header" class="taqwa-dialog__header">
                <h2 part="title" class="taqwa-dialog__title" ?hidden=${!this.slotted.title}>
                  <slot name="title" @slotchange=${this.#onSlotChange}></slot>
                </h2>
                <p part="description" class="taqwa-dialog__description" ?hidden=${!this.slotted.description}>
                  <slot name="description" @slotchange=${this.#onSlotChange}></slot>
                </p>
              </header>
              <div part="content" class="taqwa-dialog__content" ?hidden=${!this.slotted['']}>
                <slot @slotchange=${this.#onSlotChange}></slot>
              </div>
              <footer part="actions" class="taqwa-dialog__actions" ?hidden=${!this.slotted.close}>
                <slot name="close" @click=${this.#onClose} @slotchange=${this.#onSlotChange}></slot>
              </footer>
            </div>
            <button part="close" class="taqwa-dialog__close" type="button" aria-label="Close" @click=${this.#onClose}>
              ${icon(X, '1rem')}
            </button>
          </div>
        </div>
      </dialog>
    `;
  }

  async #show() {
    const dialog = this.#dialog;
    if (!dialog.open) {
      this.#returnFocus = document.activeElement as HTMLElement | null;
      if (this.modal) {
        dialog.showModal();
        this.#lockScroll();
      } else {
        dialog.show();
      }
    }
    await this.enter();
  }

  async #hide() {
    const dialog = this.#dialog;
    if (!dialog.open) return;
    await this.exit();
    if (this.open) return;
    dialog.close();
    this.#unlockScroll();
    if (this.#returnFocus?.isConnected) this.#returnFocus.focus({ preventScroll: true });
  }

  #lockScroll() {
    this.#scrollLock = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
  }

  #unlockScroll() {
    if (this.#scrollLock === undefined) return;
    document.documentElement.style.overflow = this.#scrollLock;
    this.#scrollLock = undefined;
  }

  #bindMotion() {
    this.#unbindMotion?.();
    this.#unbindMotion = bindGlassMotion(this.renderRoot.querySelector<HTMLElement>('.taqwa-dialog__close')!);
  }

  #onTrigger = () => this.request(true, 'trigger-press');
  #onClose = () => this.request(false, 'close-press');

  // Escape on a modal dialog arrives here as `cancel`; the native close is prevented so the exit animation can run first.
  #onCancel = (event: Event) => {
    event.preventDefault();
    this.request(false, 'escape-key');
  };

  #onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !this.modal) this.request(false, 'escape-key');
  };

  #onPointerDown = (event: PointerEvent) => {
    if (this.dismissOnOutsidePress && !event.composedPath().includes(this.popup)) this.request(false, 'outside-press');
  };

  #onSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    this.slotted = { ...this.slotted, [slot.name]: slot.assignedElements().length > 0 };
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-dialog': TaqwaDialog;
  }
}
