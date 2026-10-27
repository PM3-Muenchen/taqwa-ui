import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { markIconOnly } from './internal/icons';
import { bindGlassMotion } from './internal/motion';
import styles from './toggle.css?inline';

export type TogglePressedChangeDetail = { pressed: boolean };

/**
 * A two-state button that is either pressed or not.
 * @summary Two-state button with a pressed state, e.g. bold, mute or favorite.
 * @fires pressed-change - Fired when the user toggles the button. `detail: { pressed }`. Call `preventDefault()` to keep the current state.
 * @slot - Label or icon.
 * @csspart base - The inner button.
 */
@customElement('taqwa-toggle')
export class TaqwaToggle extends LitElement {
  static styles = unsafeCSS(styles);
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  /** Identifies the toggle inside a `taqwa-toggle-group`. */
  @property() value = '';
  @property({ type: Boolean, reflect: true }) pressed = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  #unbindMotion?: VoidFunction;

  render() {
    return html`<button
      part="base"
      class="taqwa-toggle"
      type="button"
      aria-pressed=${this.pressed}
      ?disabled=${this.#isDisabled()}
      @click=${this.#onClick}
    ><slot @slotchange=${markIconOnly}></slot></button>`;
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

  #isDisabled() {
    return this.disabled || (this.closest('taqwa-toggle-group')?.disabled ?? false);
  }

  #onClick() {
    const change = new CustomEvent<TogglePressedChangeDetail>('pressed-change', {
      detail: { pressed: !this.pressed },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(change);
    if (!change.defaultPrevented) this.pressed = !this.pressed;
  }

  #bindMotion() {
    this.#unbindMotion = bindGlassMotion(this.renderRoot.querySelector('button')!, {
      disabled: () => this.#isDisabled(),
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-toggle': TaqwaToggle;
  }
}
