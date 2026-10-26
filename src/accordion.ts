import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { animate } from 'motion';
import { uid } from './internal/a11y';
import { icon, Plus } from './internal/icons';
import { animateHeight, bindGlassMotion, prefersReducedMotion } from './internal/motion';
import styles from './accordion.css?inline';

const emit = (target: EventTarget, type: string, detail: unknown) =>
  target.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true, cancelable: true }));

/**
 * A set of collapsible panels. Each `taqwa-accordion-item` opens when its trigger is pressed.
 *
 * @summary Groups collapsible panels; open items are listed in `value`.
 * @fires value-change - Fired when items open or close, `detail: { value: string[] }`. Cancel to keep the current state.
 * @slot - Use `taqwa-accordion-item` children.
 */
@customElement('taqwa-accordion')
export class TaqwaAccordion extends LitElement {
  static styles = unsafeCSS(styles);

  /** Values of the open items. Set it to control the accordion, or let it update itself. */
  @property({ attribute: false }) value: string[] = [];
  /** Allows more than one item to be open at once. */
  @property({ type: Boolean }) multiple = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  render() {
    return html`<div part="base" class="taqwa-accordion"><slot></slot></div>`;
  }

  updated() {
    for (const item of this.querySelectorAll<TaqwaAccordionItem>(':scope > taqwa-accordion-item')) item.requestUpdate();
  }

  /** @internal Called by `taqwa-accordion-item` when its trigger is pressed. */
  toggleItem(value: string, open: boolean) {
    const next = open ? (this.multiple ? [...this.value, value] : [value]) : this.value.filter((v) => v !== value);
    if (!emit(this, 'value-change', { value: next })) return;
    this.value = next;
  }
}

/**
 * A heading button and a panel. Its state comes from the parent `taqwa-accordion`.
 *
 * @summary One collapsible panel with a heading trigger.
 * @fires open-change - Fired before the panel opens or closes, `detail: { open: boolean }`. Cancel to keep it as is.
 * @slot - Panel content.
 * @slot trigger - Trigger label.
 * @slot icon - Trigger indicator, defaults to a plus icon.
 * @csspart base - Outer wrapper.
 * @csspart header - Heading element wrapping the trigger.
 * @csspart trigger - Button that opens and closes the panel.
 * @csspart indicator - Icon wrapper, rotated while open.
 * @csspart panel - Collapsible region, hidden while closed.
 * @csspart content - Padded wrapper around the slotted content.
 */
@customElement('taqwa-accordion-item')
export class TaqwaAccordionItem extends LitElement {
  static styles = unsafeCSS(styles);

  /** Identifies the item in the accordion's `value`. Generated when omitted. */
  @property() value = uid('taqwa-accordion-item');
  @property({ type: Boolean, reflect: true }) disabled = false;

  #triggerId = uid('taqwa-accordion-trigger');
  #panelId = uid('taqwa-accordion-panel');
  #applied?: boolean;
  #unbindMotion?: VoidFunction;

  get root() {
    return this.closest<TaqwaAccordion>('taqwa-accordion');
  }
  get open() {
    return this.root?.value.includes(this.value) ?? false;
  }
  get isDisabled() {
    return this.disabled || !!this.root?.disabled;
  }

  render() {
    return html`<div part="base" class="taqwa-accordion-item">
      <h3 part="header" class="taqwa-accordion-header">
        <button
          part="trigger"
          class="taqwa-accordion-trigger"
          type="button"
          id=${this.#triggerId}
          aria-expanded=${this.open}
          aria-controls=${this.#panelId}
          ?disabled=${this.isDisabled}
          @click=${this.#onClick}
        >
          <span class="taqwa-accordion-title"><slot name="trigger"></slot></span>
          <span part="indicator" class="taqwa-accordion-indicator"><slot name="icon">${icon(Plus)}</slot></span>
        </button>
      </h3>
      <div part="panel" class="taqwa-accordion-panel" id=${this.#panelId} role="region" aria-labelledby=${this.#triggerId}>
        <div part="content" class="taqwa-accordion-content"><slot></slot></div>
      </div>
    </div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this.#bindMotion();
  }

  firstUpdated() {
    this.#bindMotion();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#unbindMotion?.();
  }

  updated() {
    const open = this.open;
    this.toggleAttribute('data-open', open);
    if (open === this.#applied) return;
    const panel = this.renderRoot.querySelector<HTMLElement>('.taqwa-accordion-panel')!;
    const initial = this.#applied === undefined;
    this.#applied = open;
    if (initial) {
      panel.hidden = !open;
      return;
    }
    if (open) {
      panel.hidden = false;
      panel.style.height = '0px';
    }
    const indicator = this.renderRoot.querySelector<HTMLElement>('.taqwa-accordion-indicator')!;
    animate(indicator, { rotate: open ? 45 : 0 }, prefersReducedMotion() ? { duration: 0 } : { type: 'spring', visualDuration: 0.25, bounce: 0 });
    animateHeight(panel, open).then(() => {
      if (!this.open) panel.hidden = true;
    });
  }

  #onClick() {
    if (this.isDisabled || !this.root) return;
    const open = !this.open;
    if (!emit(this, 'open-change', { open })) return;
    this.root.toggleItem(this.value, open);
  }

  #bindMotion() {
    this.#unbindMotion = bindGlassMotion(this.renderRoot.querySelector('button')!, {
      disabled: () => this.isDisabled,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-accordion': TaqwaAccordion;
    'taqwa-accordion-item': TaqwaAccordionItem;
  }
}
