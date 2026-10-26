import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { animate, hover, press, type AnimationOptions, type DOMKeyframesDefinition } from 'motion';
import styles from './button.css?inline';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

export interface ButtonMotionOptions {
  hover?: DOMKeyframesDefinition;
  press?: DOMKeyframesDefinition;
  /** State animated back to when hover or press ends. */
  rest?: DOMKeyframesDefinition;
  transition?: AnimationOptions;
}

const defaultMotion: ButtonMotionOptions = {
  hover: { scale: 1.02 },
  press: { scale: 0.98 },
  rest: { scale: 1 },
  transition: { duration: 0.15 },
};

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

@customElement('taqwa-button')
export class TaqwaButton extends LitElement {
  static styles = unsafeCSS(styles);
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };
  static formAssociated = true;

  @property({ reflect: true }) variant: ButtonVariant = 'primary';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ reflect: true }) type: 'button' | 'submit' | 'reset' = 'button';
  /** Overrides the default hover/press animations. Explicit options ignore reduced motion, like `motionProps` did. */
  @property({ attribute: false }) motionOptions?: ButtonMotionOptions;

  #internals = this.attachInternals();
  #unbindMotion: VoidFunction[] = [];

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
    this.#unbindMotion.forEach((unbind) => unbind());
    this.#unbindMotion = [];
  }

  // The inner button lives in the shadow root, so it cannot submit the host's form itself.
  #onClick() {
    if (this.disabled) return;
    const form = this.#internals.form;
    if (this.type === 'submit') form?.requestSubmit();
    else if (this.type === 'reset') form?.reset();
  }

  #bindMotion() {
    const button = this.renderRoot.querySelector('button')!;
    const options = () => ({ ...defaultMotion, ...this.motionOptions });
    const play = (target: keyof ButtonMotionOptions, force = false) => {
      const { [target]: keyframes, transition } = options();
      const enabled = !this.disabled && (this.motionOptions || !reducedMotion.matches);
      if (keyframes && (force || enabled)) animate(button, keyframes as DOMKeyframesDefinition, transition);
    };
    let hovered = false;

    this.#unbindMotion = [
      hover(button, () => {
        hovered = true;
        play('hover');
        return () => {
          hovered = false;
          play('rest', true);
        };
      }),
      press(button, () => {
        play('press');
        return () => play(hovered ? 'hover' : 'rest', !hovered);
      }),
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-button': TaqwaButton;
  }
}
