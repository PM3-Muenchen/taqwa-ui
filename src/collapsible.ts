import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { animate } from 'motion';
import { uid } from './internal/a11y';
import { ChevronDown, icon } from './internal/icons';
import { animateHeight, bindGlassMotion, prefersReducedMotion } from './internal/motion';
import styles from './collapsible.css?inline';

const emit = (target: EventTarget, type: string, detail: unknown) =>
  target.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true, cancelable: true }));

/**
 * A panel of content that a button opens and closes.
 *
 * @summary A single collapsible panel controlled by its trigger.
 * @fires open-change - Fired before the panel opens or closes, `detail: { open: boolean }`. Cancel to keep it as is.
 * @slot - Panel content.
 * @slot trigger - Trigger label.
 * @slot icon - Trigger indicator, defaults to a chevron.
 * @csspart base - Outer wrapper.
 * @csspart trigger - Button that opens and closes the panel.
 * @csspart indicator - Icon wrapper, rotated while open.
 * @csspart panel - Collapsible region, hidden while closed.
 * @csspart content - Padded wrapper around the slotted content.
 */
@customElement('taqwa-collapsible')
export class TaqwaCollapsible extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  #triggerId = uid('taqwa-collapsible-trigger');
  #panelId = uid('taqwa-collapsible-panel');
  #applied?: boolean;
  #unbindMotion?: VoidFunction;

  render() {
    return html`<div part="base" class="taqwa-collapsible">
      <button
        part="trigger"
        class="taqwa-collapsible-trigger"
        type="button"
        id=${this.#triggerId}
        aria-expanded=${this.open}
        aria-controls=${this.#panelId}
        ?disabled=${this.disabled}
        @click=${this.#onClick}
      >
        <slot name="trigger"></slot>
        <span part="indicator" class="taqwa-collapsible-indicator"><slot name="icon">${icon(ChevronDown)}</slot></span>
      </button>
      <div part="panel" class="taqwa-collapsible-panel" id=${this.#panelId} role="region" aria-labelledby=${this.#triggerId}>
        <div part="content" class="taqwa-collapsible-content"><slot></slot></div>
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
    this.toggleAttribute('data-open', this.open);
    if (this.open === this.#applied) return;
    const panel = this.renderRoot.querySelector<HTMLElement>('.taqwa-collapsible-panel')!;
    const initial = this.#applied === undefined;
    this.#applied = this.open;
    if (initial) {
      panel.hidden = !this.open;
      return;
    }
    if (this.open) {
      panel.hidden = false;
      panel.style.height = '0px';
    }
    const indicator = this.renderRoot.querySelector<HTMLElement>('.taqwa-collapsible-indicator')!;
    animate(indicator, { rotate: this.open ? 180 : 0 }, prefersReducedMotion() ? { duration: 0 } : { type: 'spring', visualDuration: 0.25, bounce: 0 });
    animateHeight(panel, this.open).then(() => {
      if (!this.open) panel.hidden = true;
    });
  }

  #onClick() {
    if (this.disabled) return;
    const open = !this.open;
    if (!emit(this, 'open-change', { open })) return;
    this.open = open;
  }

  #bindMotion() {
    this.#unbindMotion = bindGlassMotion(this.renderRoot.querySelector('button')!, {
      disabled: () => this.disabled,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-collapsible': TaqwaCollapsible;
  }
}
