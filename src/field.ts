import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { animate } from 'motion';
import { TaqwaFormControl } from './internal/form-control';
import { prefersReducedMotion } from './internal/motion';
import type { StandardSchemaV1 } from './internal/standard-schema';
import styles from './field.css?inline';

export type FieldValidationMode = 'submit' | 'blur' | 'change';
export type FieldValidationResult = string | string[] | null | undefined | void;
/** Return one or more messages to mark the value invalid, or nothing to accept it. May be async. */
export type FieldValidator = (value: unknown) => FieldValidationResult | Promise<FieldValidationResult>;

const toMessages = (result: FieldValidationResult): string[] =>
  ([] as unknown[]).concat(result).filter((message): message is string => typeof message === 'string' && message !== '');

/**
 * Labels, describes and validates the form control it wraps. Validation runs native constraints first, then `validate`
 * and `schema`. Messages from a parent `taqwa-form` (schema issues, server errors) are shown alongside them.
 * @summary Label, description and error message for one form control.
 * @slot - The form control, e.g. `<taqwa-input>`.
 * @csspart label - The visible label. Clicking it focuses the control.
 * @csspart description - Helper text.
 * @csspart error - Validation messages (`aria-live="polite"`).
 */
@customElement('taqwa-field')
export class TaqwaField extends LitElement {
  static styles = unsafeCSS(styles);

  /** Name used in form values. Also applied to the control when the control has none. */
  @property({ reflect: true }) name = '';
  @property({ reflect: true }) label = '';
  @property({ reflect: true }) description = '';
  /** `submit` (default): validate on submit, then on change. `blur`: on focus loss. `change`: on every change. */
  @property({ attribute: 'validation-mode', reflect: true }) validationMode: FieldValidationMode = 'submit';
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Forces the invalid state, e.g. when an external library owns validation. */
  @property({ type: Boolean, reflect: true }) invalid = false;
  @property({ attribute: false }) validate?: FieldValidator;
  /** Standard Schema for the control value, e.g. `z.email()`. Use `taqwa-form.schema` for whole-form rules. */
  @property({ attribute: false }) schema?: StandardSchemaV1;

  @state() private ownErrors: string[] = [];
  @state() private externalErrors: string[] = [];

  @query('.taqwa-field__error') private errorEl!: HTMLElement;

  #submitted = false;
  #touched = false;
  #focused = false;
  #initial?: string;
  #run = 0;
  #forcedDisabled = false;
  #hadErrors = false;

  /** The wrapped form control (first form-associated element inside this field). */
  get control() {
    return Array.from(this.querySelectorAll('*')).find((el): el is TaqwaFormControl => el instanceof TaqwaFormControl) ?? null;
  }

  /** Key used to route form-level schema issues: the field name, or the control's name when the field has none. */
  get fieldName() {
    return this.name || this.control?.name || '';
  }

  /** Current messages. Schema/server messages from `setExternalErrors()` take precedence over the field's own (native, `validate`, `schema`), so the browser's generic text never duplicates a schema message. */
  get errors(): string[] {
    return [...new Set(this.externalErrors.length ? this.externalErrors : this.ownErrors)];
  }

  get isInvalid() {
    return this.invalid || this.errors.length > 0;
  }

  /** Validates now and shows the messages. Also turns on change revalidation for `validationMode="submit"`. Resolves `true` when there are no errors. */
  async checkField() {
    this.#submitted = true;
    return this.#validate();
  }

  /** Replaces messages that come from outside the field, e.g. from a `taqwa-form` schema or server response. */
  setExternalErrors(messages: string[]) {
    this.externalErrors = messages;
  }

  /** Clears all messages and the submitted/touched state. Called by `taqwa-form` on reset. */
  clearErrors() {
    this.#submitted = false;
    this.#touched = false;
    this.ownErrors = [];
    this.externalErrors = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('input', this.#onChange);
    this.addEventListener('change', this.#onChange);
    this.addEventListener('focusin', this.#onFocusIn);
    this.addEventListener('focusout', this.#onFocusOut);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('input', this.#onChange);
    this.removeEventListener('change', this.#onChange);
    this.removeEventListener('focusin', this.#onFocusIn);
    this.removeEventListener('focusout', this.#onFocusOut);
  }

  protected updated() {
    this.#sync();
    this.#reflect();
    const hasErrors = this.errors.length > 0;
    if (hasErrors && !this.#hadErrors) {
      animate(this.errorEl, { opacity: [0, 1], y: [-4, 0] }, prefersReducedMotion() ? { duration: 0 } : { type: 'spring', visualDuration: 0.24, bounce: 0.1 });
    }
    this.#hadErrors = hasErrors;
  }

  render() {
    return html`
      ${this.label ? html`<label part="label" class="taqwa-field__label" @click=${this.#focusControl}>${this.label}</label>` : nothing}
      <slot @slotchange=${this.#onSlotChange}></slot>
      ${this.description ? html`<p part="description" class="taqwa-field__description">${this.description}</p>` : nothing}
      <div part="error" class="taqwa-field__error" aria-live="polite">${this.errors.map((message) => html`<p>${message}</p>`)}</div>
    `;
  }

  #onSlotChange = () => this.requestUpdate();

  #focusControl = () => this.control?.focus();

  #onFocusIn = () => {
    this.#focused = true;
    this.#reflect();
  };

  #onFocusOut = () => {
    this.#focused = false;
    this.#touched = true;
    this.#reflect();
    if (this.validationMode === 'blur') void this.#validate();
  };

  #onChange = () => {
    this.#reflect();
    if (this.validationMode === 'change' || (this.validationMode === 'submit' && this.#submitted)) void this.#validate();
  };

  // Native constraints first; custom checks only when the browser already accepts the value.
  async #validate() {
    const run = ++this.#run;
    const control = this.control;
    let messages: string[] = [];
    if (control && !control.isDisabled) {
      control.setCustomValidity('');
      messages = control.validity.valid ? await this.#customMessages(control.formValue) : [control.validationMessage];
    }
    if (run === this.#run) this.ownErrors = messages;
    return this.errors.length === 0;
  }

  async #customMessages(value: unknown) {
    const messages = toMessages(await this.validate?.(value));
    if (this.schema) {
      const result = await this.schema['~standard'].validate(value);
      messages.push(...(result.issues?.map((issue) => issue.message) ?? []));
    }
    return messages;
  }

  // Pushes labels, messages and the disabled state down to the control.
  #sync() {
    const control = this.control;
    if (!control) return;
    if (this.name && !control.name) control.name = this.name;
    this.#initial ??= JSON.stringify(control.formValue);
    if (this.disabled && !control.disabled) {
      control.disabled = true;
      this.#forcedDisabled = true;
    } else if (!this.disabled && this.#forcedDisabled) {
      control.disabled = false;
      this.#forcedDisabled = false;
    }
    const message = this.errors.join('. ');
    control.setFieldContext({
      label: this.label || undefined,
      description: this.description || undefined,
      error: message || undefined,
      invalid: this.isInvalid,
    });
    control.setCustomValidity(message);
  }

  #reflect() {
    const control = this.control;
    const value = control?.formValue;
    this.toggleAttribute('data-invalid', this.isInvalid);
    this.toggleAttribute('data-touched', this.#touched);
    this.toggleAttribute('data-focused', this.#focused);
    this.toggleAttribute('data-dirty', JSON.stringify(value) !== this.#initial);
    this.toggleAttribute('data-filled', !(value == null || value === '' || value === false || (Array.isArray(value) && !value.length)));
    this.toggleAttribute('data-disabled', this.disabled || !!control?.isDisabled);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-field': TaqwaField;
  }
}
