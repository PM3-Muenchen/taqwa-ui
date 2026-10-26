import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { bindGlassMotion, type MotionOptions } from './internal/motion';
import styles from './button.css?inline';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type ButtonMotionOptions = MotionOptions;

@customElement('taqwa-button')
export class TaqwaButton extends LitElement {
  static styles = unsafeCSS(styles);
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };
  static formAssociated = true;

  @property({ reflect: true }) variant: ButtonVariant = 'primary';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ reflect: true }) type: 'button' | 'submit' | 'reset' = 'button';
  /** Overrides the default glass hover/press animations. Explicit options ignore reduced motion. */
  @property({ attribute: false }) motionOptions?: ButtonMotionOptions;

  #internals = this.attachInternals();
  #unbindMotion?: VoidFunction;

  render() {
    return html`<button
      part="base"
      class="taqwa-button taqwa-button--${this.variant}"
      type="button"
      ?disabled=${this.disabled}
      @click=${this.#onClick}
    ><slot></slot></button>`;
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

  // The inner button lives in the shadow root, so it cannot submit the host's form itself.
  #onClick() {
    if (this.disabled) return;
    const form = this.#internals.form;
    if (this.type === 'submit') form?.requestSubmit();
    else if (this.type === 'reset') form?.reset();
  }

  #bindMotion() {
    this.#unbindMotion = bindGlassMotion(this.renderRoot.querySelector('button')!, {
      disabled: () => this.disabled,
      options: () => this.motionOptions,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-button': TaqwaButton;
  }
}
