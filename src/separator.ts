import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Orientation } from './internal/a11y';
import styles from './separator.css?inline';

/**
 * A thin rule that divides content. Exposed to assistive technology only when it separates meaningful content.
 *
 * @summary Divider line, horizontal by default.
 * @csspart base - The visible line.
 */
@customElement('taqwa-separator')
export class TaqwaSeparator extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ reflect: true }) orientation: Orientation = 'horizontal';

  #internals = this.attachInternals();

  render() {
    return html`<div part="base" class="taqwa-separator" data-orientation=${this.orientation}></div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.#internals.role = 'separator';
    this.#internals.ariaOrientation = this.orientation;
  }

  updated() {
    this.#internals.ariaOrientation = this.orientation;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-separator': TaqwaSeparator;
  }
}
