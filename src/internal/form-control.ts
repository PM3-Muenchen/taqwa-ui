import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

/** Labelling context pushed by `taqwa-field`. ARIA ids cannot cross shadow roots, so text is handed over instead. */
export interface FieldContext {
  label?: string;
  description?: string;
  error?: string;
  invalid?: boolean;
}

/**
 * Base for every form-associated value control (input, checkbox, select, slider, …).
 * Subclasses must: implement `formValue`, `validationAnchor` and `formResetCallback`, call `commitValue()` whenever the
 * value changes, and render `controlLabel` / `controlDescription` / `controlInvalid` onto their focusable element.
 */
export abstract class TaqwaFormControl extends LitElement {
  static formAssociated = true;
  static shadowRootOptions: ShadowRootInit = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  @property({ reflect: true }) name = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;

  @state() protected fieldContext: FieldContext = {};
  @state() protected formDisabled = false;

  protected readonly internals = this.attachInternals();
  #flags: ValidityStateFlags = {};
  #message = '';
  #customError = '';

  /** Typed value used by `taqwa-form` and schemas: number for number-field, boolean for switch, string[] for groups, … */
  abstract get formValue(): unknown;
  /** Focusable element inside the shadow root that validation messages anchor to. */
  protected abstract get validationAnchor(): HTMLElement | null | undefined;
  abstract formResetCallback(): void;

  get form() {
    return this.internals.form;
  }
  get validity() {
    return this.internals.validity;
  }
  get validationMessage() {
    return this.internals.validationMessage;
  }
  get willValidate() {
    return this.internals.willValidate;
  }
  checkValidity() {
    return this.internals.checkValidity();
  }
  reportValidity() {
    return this.internals.reportValidity();
  }
  setCustomValidity(message: string) {
    this.#customError = message;
    this.#applyValidity();
  }

  /** Disabled directly or by a disabled `<fieldset>`/`taqwa-fieldset` ancestor. */
  get isDisabled() {
    return this.disabled || this.formDisabled;
  }

  formDisabledCallback(disabled: boolean) {
    this.formDisabled = disabled;
  }

  /** @internal Called by `taqwa-field`. */
  setFieldContext(context: FieldContext) {
    this.fieldContext = context;
  }

  protected get controlLabel() {
    return this.fieldContext.label ?? this.getAttribute('aria-label') ?? undefined;
  }
  protected get controlDescription() {
    const text = [this.fieldContext.description, this.fieldContext.invalid ? this.fieldContext.error : undefined].filter(Boolean).join('. ');
    return text || undefined;
  }
  protected get controlInvalid() {
    return this.fieldContext.invalid ? 'true' : undefined;
  }

  /**
   * Submit `value` with the form and record native constraint state, e.g. `{ valueMissing: true }`.
   * Pass `null` to submit nothing (unchecked checkbox, empty select).
   */
  protected commitValue(value: File | string | FormData | null, flags: ValidityStateFlags = {}, message = '') {
    this.internals.setFormValue(value);
    this.#flags = flags;
    this.#message = message;
    this.#applyValidity();
  }

  /** Dispatches a bubbling, composed event. Use for `value-change`, `checked-change`, and native-like `input`/`change`. */
  protected emit<T>(type: string, detail?: T) {
    return this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true, cancelable: true }));
  }

  #applyValidity() {
    const flags = { ...this.#flags, customError: !!this.#customError };
    const invalid = Object.values(flags).some(Boolean);
    const message = this.#customError || this.#message || (flags.valueMissing ? 'Please fill out this field.' : 'Invalid value.');
    if (invalid) this.internals.setValidity(flags, message, this.validationAnchor ?? undefined);
    else this.internals.setValidity({});
  }
}
