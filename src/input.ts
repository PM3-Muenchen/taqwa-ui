import { html, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { TaqwaFormControl } from './internal/form-control';
import { bindGlassMotion, fieldGlassMotion } from './internal/motion';
import styles from './input.css?inline';

const VALIDITY_FLAGS = [
  'badInput',
  'patternMismatch',
  'rangeOverflow',
  'rangeUnderflow',
  'stepMismatch',
  'tooLong',
  'tooShort',
  'typeMismatch',
  'valueMissing',
] as const;

/**
 * Single-line text input that submits with its form. Native constraints (`required`, `pattern`, `min`, …) are
 * reported to the form, so `taqwa-field` and `taqwa-form` see them without extra wiring.
 * @summary Liquid glass text input; works inside `taqwa-field` and `taqwa-form`.
 * @fires value-change - `{ value }` on every keystroke. Call `preventDefault()` to keep the previous value.
 * @fires change - Re-dispatched from the inner input when the value is committed.
 * @csspart base - The inner `<input>` element.
 */
@customElement('taqwa-input')
export class TaqwaInput extends TaqwaFormControl {
  static styles = unsafeCSS(styles);

  @property() type = 'text';
  @property() value = '';
  @property() placeholder?: string;
  @property() autoComplete?: string;
  @property() inputmode?: string;
  @property() pattern?: string;
  @property({ type: Number }) minLength?: number;
  @property({ type: Number }) maxLength?: number;
  @property() min?: string;
  @property() max?: string;
  @property({ type: Boolean }) readOnly = false;

  @query('input') private inner!: HTMLInputElement;

  #unbindMotion?: VoidFunction;

  get formValue(): string | number {
    return this.type === 'number' && this.value !== '' ? Number(this.value) : this.value;
  }

  protected get validationAnchor() {
    return this.inner;
  }

  formResetCallback() {
    this.value = this.getAttribute('value') ?? '';
  }

  render() {
    return html`<div class="taqwa-input">
      <input
        part="base"
        class="taqwa-input__field"
        type=${this.type}
        .value=${this.value}
        ?required=${this.required}
        ?disabled=${this.isDisabled}
        ?readonly=${this.readOnly}
        placeholder=${ifDefined(this.placeholder)}
        autocomplete=${ifDefined(this.autoComplete)}
        inputmode=${ifDefined(this.inputmode)}
        pattern=${ifDefined(this.pattern)}
        minlength=${ifDefined(this.minLength)}
        maxlength=${ifDefined(this.maxLength)}
        min=${ifDefined(this.min)}
        max=${ifDefined(this.max)}
        aria-label=${ifDefined(this.controlLabel)}
        aria-description=${ifDefined(this.controlDescription)}
        aria-invalid=${ifDefined(this.controlInvalid)}
        @input=${this.#onInput}
        @change=${this.#onChange}
      />
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

  protected updated() {
    this.#commit();
  }

  // Runs synchronously on input so a field's validation (listening on the same event) sees the new validity.
  #onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!this.emit('value-change', { value: input.value })) {
      input.value = this.value;
      return;
    }
    this.value = input.value;
    this.#commit();
  }

  // The inner input is in the shadow root, so re-dispatch the native change (it is not composed).
  #onChange() {
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  #commit() {
    const { validity, validationMessage } = this.inner;
    const flags = Object.fromEntries(VALIDITY_FLAGS.map((flag) => [flag, validity[flag]])) as ValidityStateFlags;
    this.commitValue(this.value, flags, validationMessage);
  }

  #bindMotion() {
    this.#unbindMotion = bindGlassMotion(this.renderRoot.querySelector('.taqwa-input') as HTMLElement, {
      disabled: () => this.isDisabled,
      preset: fieldGlassMotion,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-input': TaqwaInput;
  }
}
