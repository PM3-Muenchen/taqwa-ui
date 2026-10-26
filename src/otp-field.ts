import { html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { TaqwaFormControl } from './internal/form-control';
import styles from './otp-field.css?inline';

/** Characters accepted by each `mode`. */
export type OtpMode = 'numeric' | 'alphanumeric';

const patterns: Record<OtpMode, RegExp> = { numeric: /\d/, alphanumeric: /[a-z0-9]/i };

/**
 * One box per character. Typing advances, Backspace steps back, and pasted or autofilled codes fill the boxes.
 * The value stays contiguous: a box after the last character is filled from the end.
 *
 * @summary Enters a one-time code across several character boxes.
 * @fires value-change - `{ value }`. Cancelable: `preventDefault()` keeps the current value.
 * @fires complete - `{ value }` when the code reaches `length`.
 * @fires input - Dispatched after a change.
 * @fires change - Dispatched after a change.
 * @csspart base - The wrapper with `role="group"`.
 * @csspart input - One character box.
 */
@customElement('taqwa-otp-field')
export class TaqwaOtpField extends TaqwaFormControl {
  static styles = unsafeCSS(styles);

  @property({ type: Number }) length = 6;
  @property() value = '';
  @property({ reflect: true }) mode: OtpMode = 'numeric';
  /** Obscures the characters with `type="password"`. */
  @property({ type: Boolean }) mask = false;
  @property({ type: Boolean, reflect: true, attribute: 'read-only' }) readOnly = false;

  #defaultValue = '';

  get formValue() {
    return this.value;
  }

  protected get validationAnchor() {
    return this.renderRoot.querySelector<HTMLElement>('input');
  }

  firstUpdated() {
    this.#defaultValue = this.value;
  }

  updated() {
    this.#paint();
    this.#commit();
  }

  formResetCallback() {
    this.value = this.#defaultValue;
  }

  render() {
    const disabled = this.isDisabled;
    return html`<div part="base" class="taqwa-otp-field" role="group" aria-label=${ifDefined(this.controlLabel)} aria-description=${ifDefined(this.controlDescription)}>${Array.from(
      { length: this.length },
      (_, index) => html`<input
        part="input"
        class="taqwa-otp-field__input"
        type=${this.mask ? 'password' : 'text'}
        inputmode=${this.mode === 'numeric' ? 'numeric' : 'text'}
        autocomplete=${index === 0 ? 'one-time-code' : 'off'}
        aria-label=${`Character ${index + 1} of ${this.length}`}
        aria-invalid=${ifDefined(this.controlInvalid)}
        ?disabled=${disabled}
        ?readonly=${this.readOnly}
        @keydown=${(event: KeyboardEvent) => this.#onKeyDown(event, index)}
        @input=${(event: Event) => this.#onInput(event, index)}
        @paste=${(event: ClipboardEvent) => {
          event.preventDefault();
          this.#fill(index, event.clipboardData?.getData('text') ?? '');
        }}
        @focus=${(event: FocusEvent) => (event.target as HTMLInputElement).select()}
      />`,
    )}</div>`;
  }

  #paint() {
    this.renderRoot.querySelectorAll<HTMLInputElement>('input').forEach((input, index) => {
      input.value = this.value[index] ?? '';
    });
  }

  #focus(index: number) {
    const inputs = this.renderRoot.querySelectorAll<HTMLInputElement>('input');
    inputs[Math.min(Math.max(index, 0), this.length - 1)]?.focus();
  }

  #set(next: string) {
    if (next === this.value) return;
    if (!this.emit('value-change', { value: next })) return;
    this.value = next;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    if (next.length === this.length) this.emit('complete', { value: next });
  }

  /** Writes accepted characters from `index`, overwriting what is there. */
  #fill(index: number, text: string) {
    const incoming = Array.from(text)
      .filter((char) => patterns[this.mode].test(char))
      .join('');
    if (!incoming) return;
    const start = Math.min(index, this.value.length);
    const next = (this.value.slice(0, start) + incoming + this.value.slice(start + incoming.length)).slice(0, this.length);
    this.#set(next);
    this.#focus(start + incoming.length);
  }

  #erase(index: number) {
    if (!this.value) return;
    const position = Math.min(index, this.value.length - 1);
    this.#set(this.value.slice(0, position) + this.value.slice(position + 1));
    this.#focus(position);
  }

  #onKeyDown(event: KeyboardEvent, index: number) {
    if (this.isDisabled || this.readOnly) return;
    switch (event.key) {
      case 'Backspace':
        event.preventDefault();
        this.#erase(index);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.#focus(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.#focus(index + 1);
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          this.#fill(index, event.key);
        }
    }
  }

  /** Mobile keyboards send no usable keydown, so the input event handles typing, deletion and autofill. */
  #onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const current = this.value[index] ?? '';
    if (!input.value) this.#erase(index);
    else this.#fill(index, input.value.startsWith(current) ? input.value.slice(current.length) : input.value);
    this.#paint();
  }

  #commit() {
    const disabled = this.isDisabled;
    this.commitValue(
      this.value && !disabled ? this.value : null,
      { valueMissing: this.required && this.value.length < this.length && !disabled },
      'Please enter the full code.',
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-otp-field': TaqwaOtpField;
  }
}
