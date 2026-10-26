import { html, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { TaqwaFormControl } from './internal/form-control';
import { Minus, Plus, icon } from './internal/icons';
import { bindGlassMotion } from './internal/motion';
import styles from './number-field.css?inline';

/**
 * A text input for numbers with glass steppers. Typing is parsed with the locale's separators, out-of-range values
 * are clamped on blur, and the form sees `null` when the field is empty.
 *
 * @summary Edits a number with buttons, arrow keys and optional formatting.
 * @fires value-change - `{ value }`, `number | null`. Cancelable: `preventDefault()` keeps the current value.
 * @fires input - Dispatched after a change.
 * @fires change - Dispatched after a change.
 * @csspart base - The wrapper around the stepper buttons and input.
 * @csspart decrement - The decrement button.
 * @csspart input - The `role="spinbutton"` text input.
 * @csspart increment - The increment button.
 */
@customElement('taqwa-number-field')
export class TaqwaNumberField extends TaqwaFormControl {
  static styles = unsafeCSS(styles);

  @property({ type: Number }) value: number | null = null;
  @property({ type: Number }) min: number | undefined = undefined;
  @property({ type: Number }) max: number | undefined = undefined;
  @property({ type: Number }) step = 1;
  @property({ type: Number, attribute: 'small-step' }) smallStep = 0.1;
  @property({ type: Number, attribute: 'large-step' }) largeStep = 10;
  /** `Intl.NumberFormat` options used to display the value, e.g. `{ style: 'currency', currency: 'USD' }`. */
  @property({ attribute: false }) format: Intl.NumberFormatOptions | undefined = undefined;
  /** BCP 47 locale for display and parsing. Defaults to the runtime locale. */
  @property() locale: string | undefined = undefined;
  @property({ type: Boolean, reflect: true, attribute: 'read-only' }) readOnly = false;

  @state() protected inputText = '';
  @state() protected invalidText = false;

  #editing = false;
  #defaultValue: number | null = null;
  #unbindSteppers: VoidFunction[] = [];

  get formValue() {
    return this.value;
  }

  protected get validationAnchor() {
    return this.renderRoot.querySelector<HTMLElement>('input');
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this.#bindSteppers();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#unbindSteppers.forEach((unbind) => unbind());
    this.#unbindSteppers = [];
  }

  firstUpdated() {
    this.#defaultValue = this.value;
    this.#bindSteppers();
  }

  updated(changed: PropertyValues<this>) {
    if (!this.#editing && (changed.has('value') || changed.has('format') || changed.has('locale'))) {
      this.inputText = this.#format(this.value);
    }
    this.#commit();
  }

  formResetCallback() {
    this.value = this.#defaultValue;
  }

  render() {
    const disabled = this.isDisabled;
    const atMin = this.min !== undefined && (this.value ?? 0) <= this.min;
    const atMax = this.max !== undefined && (this.value ?? 0) >= this.max;
    return html`<div part="base" class="taqwa-number-field">
      <button
        part="decrement"
        type="button"
        class="taqwa-number-field__step"
        aria-label="Decrease"
        ?disabled=${disabled || this.readOnly || atMin}
        @click=${() => this.#stepBy(-1, this.step)}
      >${icon(Minus, 16)}</button>
      <input
        part="input"
        class="taqwa-number-field__input"
        type="text"
        role="spinbutton"
        inputmode="decimal"
        autocomplete="off"
        aria-roledescription="Number field"
        aria-label=${ifDefined(this.controlLabel)}
        aria-description=${ifDefined(this.controlDescription)}
        aria-invalid=${ifDefined(this.controlInvalid)}
        aria-valuemin=${ifDefined(this.min)}
        aria-valuemax=${ifDefined(this.max)}
        aria-valuenow=${ifDefined(this.value ?? undefined)}
        .value=${this.inputText}
        ?disabled=${disabled}
        ?readonly=${this.readOnly}
        ?required=${this.required}
        @input=${this.#onInput}
        @blur=${this.#commitText}
        @keydown=${this.#onKeyDown}
      />
      <button
        part="increment"
        type="button"
        class="taqwa-number-field__step"
        aria-label="Increase"
        ?disabled=${disabled || this.readOnly || atMax}
        @click=${() => this.#stepBy(1, this.step)}
      >${icon(Plus, 16)}</button>
    </div>`;
  }

  #bindSteppers() {
    this.renderRoot.querySelectorAll<HTMLElement>('.taqwa-number-field__step').forEach((step) => {
      this.#unbindSteppers.push(bindGlassMotion(step, { disabled: () => this.isDisabled || this.readOnly }));
    });
  }

  #format(value: number | null) {
    return value === null ? '' : new Intl.NumberFormat(this.locale, this.format).format(value);
  }

  /** `null` for empty text, `undefined` for text that is not a number. */
  #parse(text: string): number | null | undefined {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const parts = new Intl.NumberFormat(this.locale).formatToParts(12345.6);
    const group = parts.find((part) => part.type === 'group')?.value ?? ',';
    const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
    const cleaned = trimmed.split(group).join('').replace(decimal, '.').replace(/[^\d.-]/g, '');
    const parsed = Number(cleaned);
    return cleaned && !Number.isNaN(parsed) ? parsed : undefined;
  }

  #clamp(value: number) {
    return Math.min(this.max ?? Infinity, Math.max(this.min ?? -Infinity, value));
  }

  #update(next: number | null) {
    if (next === this.value) return;
    if (!this.emit('value-change', { value: next })) return;
    this.value = next;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  /** Commits a value from a button, key or blur, and shows it formatted. */
  #apply(next: number | null) {
    this.#editing = false;
    this.invalidText = false;
    this.#update(next);
    this.inputText = this.#format(this.value);
  }

  #stepBy(direction: 1 | -1, amount: number) {
    if (this.isDisabled || this.readOnly) return;
    this.#apply(this.#clamp(Number(((this.value ?? 0) + direction * amount).toFixed(10))));
  }

  #onInput = (event: Event) => {
    this.#editing = true;
    this.inputText = (event.target as HTMLInputElement).value;
    const parsed = this.#parse(this.inputText);
    this.invalidText = parsed === undefined;
    if (parsed !== undefined) this.#update(parsed);
  };

  #commitText = () => {
    const parsed = this.#parse(this.inputText);
    if (parsed === undefined) {
      this.#editing = false;
      this.invalidText = true;
      return;
    }
    this.#apply(parsed === null ? null : this.#clamp(parsed));
  };

  #onKeyDown = (event: KeyboardEvent) => {
    if (this.isDisabled || this.readOnly) return;
    const amount = event.altKey ? this.smallStep : event.shiftKey ? this.largeStep : this.step;
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.#stepBy(1, amount);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.#stepBy(-1, amount);
        break;
      case 'Home':
        if (this.min === undefined) break;
        event.preventDefault();
        this.#apply(this.min);
        break;
      case 'End':
        if (this.max === undefined) break;
        event.preventDefault();
        this.#apply(this.max);
        break;
      case 'Enter':
        this.#commitText();
        break;
    }
  };

  #commit() {
    const value = this.value;
    const disabled = this.isDisabled;
    const quotient = value === null ? 0 : (value - (this.min ?? 0)) / this.step;
    const flags: ValidityStateFlags = {
      valueMissing: this.required && value === null,
      badInput: this.invalidText,
      rangeUnderflow: value !== null && this.min !== undefined && value < this.min,
      rangeOverflow: value !== null && this.max !== undefined && value > this.max,
      stepMismatch: value !== null && Math.abs(quotient - Math.round(quotient)) > 1e-9,
    };
    const message = flags.valueMissing || flags.badInput
      ? 'Please enter a valid number.'
      : flags.rangeUnderflow
        ? `Please enter ${this.min} or more.`
        : flags.rangeOverflow
          ? `Please enter ${this.max} or less.`
          : `Please enter a multiple of ${this.step}.`;
    this.commitValue(value === null || disabled ? null : String(value), disabled ? {} : flags, message);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-number-field': TaqwaNumberField;
  }
}
