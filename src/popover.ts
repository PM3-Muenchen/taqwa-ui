import { html, LitElement, nothing, unsafeCSS, type CSSResultGroup, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { animatePopupIn, animatePopupOut, type Side } from './internal/motion';
import { anchorPopup, onDismiss, type Placement } from './internal/popup';
import styles from './popover.css?inline';

export type PopupSide = Side;
export type PopupAlign = 'start' | 'center' | 'end';
export type PopupChangeReason = 'trigger-hover' | 'trigger-focus' | 'trigger-press' | 'outside-press' | 'escape-key' | 'imperative-action';
export interface PopupOpenChangeDetail {
  open: boolean;
  reason: PopupChangeReason;
}

/**
 * Shared behaviour for the popup family (popover, tooltip, preview card): slotted trigger wiring, hover and focus
 * timing, light dismiss, and enter/exit motion. Not registered itself.
 */
export abstract class TaqwaPopupBase extends LitElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ reflect: true }) side: PopupSide = 'bottom';
  @property({ reflect: true }) align: PopupAlign = 'center';
  @property({ type: Number, attribute: 'side-offset' }) sideOffset = 8;
  @property({ type: Boolean }) arrow = false;

  protected abstract readonly delay: number;
  protected abstract readonly closeDelay: number;
  protected abstract readonly popupClass: string;
  protected popupRole?: string;

  #timer = 0;
  #reason: PopupChangeReason = 'imperative-action';
  #placedSide: PopupSide = 'bottom';
  #exit?: ReturnType<typeof animatePopupOut>;
  #unbindDismiss?: VoidFunction;
  #unbindAnchor?: VoidFunction;

  protected get popupEl() {
    return this.renderRoot.querySelector<HTMLElement>('[part="popup"]');
  }

  protected slotted(name: string) {
    return this.querySelector<HTMLElement>(`:scope > [slot="${name}"]`);
  }

  protected get triggerEl() {
    return this.slotted('trigger');
  }

  /** Whether hovering the trigger (mouse or pen) opens the popup. */
  protected hoverOpens() {
    return true;
  }

  /** Whether focusing the trigger opens the popup. */
  protected focusOpens() {
    return false;
  }

  protected openDelay() {
    return this.delay;
  }

  /** Called on trigger click. */
  protected onPress() {}

  protected opened(_reason: PopupChangeReason) {}

  protected closed(_reason: PopupChangeReason) {}

  /** Sets ARIA on the slotted trigger and the popup. Runs after every update. */
  protected syncAria() {}

  protected renderContent(): TemplateResult {
    return html`<slot></slot>`;
  }

  /** Requests an open-state change. Dispatches a cancelable `open-change`; `preventDefault()` keeps the current state. */
  protected request(open: boolean, reason: PopupChangeReason) {
    clearTimeout(this.#timer);
    if (open === this.open) return;
    const event = new CustomEvent<PopupOpenChangeDetail>('open-change', {
      detail: { open, reason },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
    if (event.defaultPrevented) return;
    this.#reason = reason;
    this.open = open;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated && this.open) this.#show();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.#timer);
    this.#exit?.stop();
    this.#exit = undefined;
    this.#unbindDismiss?.();
    this.#unbindAnchor?.();
    this.#unbindDismiss = this.#unbindAnchor = undefined;
    if (this.popupEl?.matches(':popover-open')) this.popupEl.hidePopover();
  }

  protected updated(changed: PropertyValues) {
    if (changed.has('open')) {
      if (this.open) this.#show();
      else this.#hide();
    }
    this.syncAria();
  }

  render() {
    return html`
      <slot
        name="trigger"
        @click=${this.#onClick}
        @focusin=${this.#onFocusIn}
        @focusout=${this.#onFocusOut}
        @pointerover=${this.#onPointerOver}
        @pointerout=${this.#onPointerOut}
      ></slot>
      <div
        part="popup"
        class="taqwa-popup ${this.popupClass}"
        popover="manual"
        tabindex="-1"
        role=${ifDefined(this.popupRole)}
        @pointerenter=${this.#onPopupEnter}
        @pointerleave=${this.#onPopupLeave}
      >
        ${this.arrow ? html`<span part="arrow" class="taqwa-popup__arrow"></span>` : nothing}
        ${this.renderContent()}
      </div>
    `;
  }

  #show() {
    const popup = this.popupEl;
    if (!popup) return;
    this.#exit?.stop();
    this.#exit = undefined;
    if (!popup.matches(':popover-open')) popup.showPopover();

    const trigger = this.triggerEl;
    this.#unbindAnchor?.();
    this.#placedSide = this.side;
    this.#unbindAnchor = trigger
      ? anchorPopup(trigger, popup, {
          placement: (this.align === 'center' ? this.side : `${this.side}-${this.align}`) as Placement,
          offset: this.sideOffset,
          arrow: this.renderRoot.querySelector<HTMLElement>('[part="arrow"]'),
          onSide: (side) => (this.#placedSide = side),
        })
      : undefined;

    this.#unbindDismiss?.();
    this.#unbindDismiss = onDismiss(
      () => [this.triggerEl, popup],
      (kind) => this.request(false, kind === 'escape' ? 'escape-key' : 'outside-press'),
    );
    animatePopupIn(popup, this.#placedSide);
    this.opened(this.#reason);
  }

  #hide() {
    const popup = this.popupEl;
    if (!popup?.matches(':popover-open') || this.#exit) return;
    this.#unbindDismiss?.();
    this.#unbindDismiss = undefined;
    // Keep keyboard users from losing focus when the popup they were in disappears.
    if (popup.matches(':focus-within')) this.triggerEl?.focus();

    const reason = this.#reason;
    const exit = animatePopupOut(popup, this.#placedSide);
    this.#exit = exit;
    exit.then(() => {
      if (this.#exit !== exit) return;
      this.#exit = undefined;
      this.#unbindAnchor?.();
      this.#unbindAnchor = undefined;
      popup.hidePopover();
      this.closed(reason);
    });
  }

  #schedule(open: boolean, delay: number, reason: PopupChangeReason) {
    clearTimeout(this.#timer);
    this.#timer = window.setTimeout(() => this.request(open, reason), delay);
  }

  #inTrigger(event: PointerEvent | FocusEvent) {
    return this.triggerEl?.contains(event.relatedTarget as Node | null) ?? false;
  }

  #onClick() {
    this.onPress();
  }

  #onPointerOver(event: PointerEvent) {
    if (event.pointerType === 'touch' || !this.hoverOpens() || this.#inTrigger(event)) return;
    this.#schedule(true, this.openDelay(), 'trigger-hover');
  }

  #onPointerOut(event: PointerEvent) {
    if (event.pointerType === 'touch' || !this.hoverOpens() || this.#inTrigger(event)) return;
    this.#schedule(false, this.closeDelay, 'trigger-hover');
  }

  #onPopupEnter() {
    clearTimeout(this.#timer);
  }

  #onPopupLeave() {
    if (this.hoverOpens()) this.#schedule(false, this.closeDelay, 'trigger-hover');
  }

  #onFocusIn() {
    if (this.focusOpens()) this.#schedule(true, this.openDelay(), 'trigger-focus');
  }

  #onFocusOut(event: FocusEvent) {
    if (this.focusOpens() && !this.#inTrigger(event)) this.request(false, 'trigger-focus');
  }
}

/**
 * An anchored, non-modal dialog opened from its trigger. Focus moves into the popover on press and returns to the
 * trigger on Escape or when the popover is closed while focused.
 *
 * @summary Anchored dialog with an optional title, description and close control.
 * @fires open-change - Fired when the popover opens or closes. `detail`: `{ open, reason }`. Cancelable.
 * @slot trigger - The element that opens the popover (a button or link).
 * @slot title - Heading of the popover, labels the dialog.
 * @slot description - Description of the popover, describes the dialog.
 * @slot close - Element that closes the popover when clicked.
 * @slot - Popover body content.
 * @csspart popup - The floating dialog surface.
 * @csspart arrow - The optional pointer arrow.
 */
@customElement('taqwa-popover')
export class TaqwaPopover extends TaqwaPopupBase {
  protected readonly popupClass = 'taqwa-popover';
  protected popupRole = 'dialog';

  @property({ type: Boolean, attribute: 'open-on-hover' }) openOnHover = false;
  @property({ type: Number }) delay = 600;
  @property({ type: Number, attribute: 'close-delay' }) closeDelay = 300;

  protected hoverOpens() {
    return this.openOnHover;
  }

  protected onPress() {
    this.request(!this.open, 'trigger-press');
  }

  protected opened(reason: PopupChangeReason) {
    if (reason === 'trigger-press') this.popupEl?.focus();
  }

  protected syncAria() {
    const trigger = this.triggerEl;
    const popup = this.popupEl;
    trigger?.setAttribute('aria-haspopup', 'dialog');
    trigger?.setAttribute('aria-expanded', String(this.open));
    if (!popup) return;
    const title = this.slotted('title');
    const description = this.slotted('description');
    popup.ariaLabelledByElements = title ? [title] : null;
    popup.ariaDescribedByElements = description ? [description] : null;
    // Text fallback for browsers without ARIA element reflection (Chrome < 135, Firefox < 136).
    popup.ariaLabel = title?.textContent?.trim() || null;
    if (description?.textContent?.trim()) popup.setAttribute('aria-description', description.textContent.trim());
    else popup.removeAttribute('aria-description');
  }

  protected renderContent() {
    return html`
      <slot name="title" class="taqwa-popover__title"></slot>
      <slot name="description" class="taqwa-popover__description"></slot>
      <slot></slot>
      <slot name="close" @click=${() => this.request(false, 'imperative-action')}></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-popover': TaqwaPopover;
  }
}
