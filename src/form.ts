import { LitElement, html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './field';
import type { TaqwaField } from './field';
import { TaqwaFormControl } from './internal/form-control';
import { issuePath, type StandardSchemaV1 } from './internal/standard-schema';
import styles from './form.css?inline';

/** Messages keyed by field name. Strings are wrapped into lists. */
export type FormErrors = Record<string, string | string[]>;
export type FormValues = Record<string, unknown>;
export interface FormSubmitDetail {
  /** Values keyed by field name. Dotted names (`address.city`) become nested objects. */
  values: FormValues;
  /** Schema output when `schema` passes, otherwise `values`. */
  output: unknown;
}

type NativeControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const toList = (messages: string | string[] = []) => ([] as string[]).concat(messages);

// Mirrors what the browser would submit, but reads Taqwa controls through `formValue`.
function collect(form: HTMLFormElement): FormValues {
  const entries = new Map<string, unknown>();
  const elements = Array.from(form.elements) as (NativeControl | TaqwaFormControl)[];
  for (const el of elements) {
    if (!el.name) continue;
    if (el instanceof TaqwaFormControl) {
      if (!el.isDisabled) entries.set(el.name, el.formValue);
      continue;
    }
    if (el.disabled) continue;
    const { type } = el as HTMLInputElement;
    if (['button', 'submit', 'reset', 'image'].includes(type)) continue;
    if (type === 'checkbox') {
      const boxes = (elements as HTMLInputElement[]).filter((box) => box.name === el.name && box.type === 'checkbox');
      entries.set(el.name, boxes.length > 1 ? boxes.filter((box) => box.checked).map((box) => box.value) : (el as HTMLInputElement).checked);
    } else if (type === 'radio') {
      if (!entries.has(el.name)) entries.set(el.name, null);
      if ((el as HTMLInputElement).checked) entries.set(el.name, (el as HTMLInputElement).value);
    } else if (type === 'file') {
      const { files, multiple } = el as HTMLInputElement;
      entries.set(el.name, multiple ? Array.from(files ?? []) : files?.[0] ?? null);
    } else if (el instanceof HTMLSelectElement && el.multiple) {
      entries.set(el.name, Array.from(el.selectedOptions, (option) => option.value));
    } else {
      entries.set(el.name, el.value);
    }
  }
  const values: FormValues = {};
  for (const [path, value] of entries) {
    const keys = path.split('.');
    const last = keys.pop()!;
    let target = values;
    for (const key of keys) target = (target[key] ??= {}) as FormValues;
    target[last] = value;
  }
  return values;
}

/**
 * Wraps a native `<form>` (in light DOM) and runs Taqwa validation on submit: every `taqwa-field`, then the optional
 * `schema`. Issues go to the field whose name matches the issue path; the rest are shown here.
 *
 * ```html
 * <taqwa-form .schema=${schema}>
 *   <form>
 *     <taqwa-field name="email" label="Email"><taqwa-input type="email"></taqwa-input></taqwa-field>
 *     <taqwa-button type="submit">Send</taqwa-button>
 *   </form>
 * </taqwa-form>
 * ```
 * @summary Form that validates fields and a Standard Schema before submitting.
 * @fires form-submit - `{ values, output }` after validation passes. Call `preventDefault()` to skip the native submit.
 * @slot - The native `<form>` element.
 * @csspart error - Form-level messages (unmatched schema issues, server errors without a field).
 */
@customElement('taqwa-form')
export class TaqwaForm extends LitElement {
  static styles = unsafeCSS(styles);

  /** Errors from the server or another source, keyed by field name. Cleared for a field when its value changes. */
  @property({ attribute: false }) errors: FormErrors = {};
  /** Standard Schema (Zod, Valibot, ArkType) for all values. Its output is sent with `form-submit`. */
  @property({ attribute: false }) schema?: StandardSchemaV1;
  /** Keep the native submission from running after validation. Handle the submit in `form-submit`. */
  @property({ type: Boolean, attribute: 'prevent-default-submit' }) preventDefaultSubmit = false;

  @state() private formErrors: string[] = [];

  #bypass = false;
  #submitted = false;
  #serverErrors: FormErrors = {};
  #schemaErrors: Record<string, string[]> = {};

  willUpdate(changed: PropertyValues) {
    if (changed.has('errors')) {
      this.#serverErrors = { ...this.errors };
      this.#applyErrors();
    }
  }

  firstUpdated() {
    const form = this.querySelector('form');
    if (form) form.noValidate = true;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('submit', this.#onSubmit);
    this.addEventListener('reset', this.#onReset);
    this.addEventListener('input', this.#onChange);
    this.addEventListener('change', this.#onChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('submit', this.#onSubmit);
    this.removeEventListener('reset', this.#onReset);
    this.removeEventListener('input', this.#onChange);
    this.removeEventListener('change', this.#onChange);
  }

  render() {
    return html`<slot></slot>${this.formErrors.length
      ? html`<div part="error" class="taqwa-form__error" role="alert">${this.formErrors.map((message) => html`<p>${message}</p>`)}</div>`
      : nothing}`;
  }

  #fields() {
    return Array.from(this.querySelectorAll<TaqwaField>('taqwa-field'));
  }

  #hasErrors() {
    return this.formErrors.length > 0 || this.#fields().some((field) => field.errors.length > 0);
  }

  // Returns the schema output for valid values; stores the issues for `#applyErrors`.
  async #checkSchema(values: FormValues): Promise<unknown> {
    const errors: Record<string, string[]> = {};
    let output: unknown = values;
    if (this.schema) {
      const result = await this.schema['~standard'].validate(values);
      if (result.issues) {
        for (const issue of result.issues) (errors[issuePath(issue)] ??= []).push(issue.message);
      } else {
        output = result.value;
      }
    }
    this.#schemaErrors = errors;
    return output;
  }

  #applyErrors() {
    const fields = this.#fields();
    const names = new Set(fields.map((field) => field.fieldName));
    for (const field of fields) {
      field.setExternalErrors([...toList(this.#serverErrors[field.fieldName]), ...(this.#schemaErrors[field.fieldName] ?? [])]);
    }
    const unmatched = (errors: FormErrors) =>
      Object.entries(errors)
        .filter(([name]) => !names.has(name))
        .flatMap(([, messages]) => toList(messages));
    this.formErrors = [...unmatched(this.#schemaErrors), ...unmatched(this.#serverErrors)];
  }

  // Preventing the event here stops the browser's own validation and submission. A passing submit re-enters
  // this listener through `requestSubmit()`, and `#bypass` lets that one through.
  #onSubmit = async (event: Event) => {
    if (this.#bypass) return;
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const { submitter } = event as SubmitEvent;
    this.#submitted = true;
    const values = collect(form);
    const fields = this.#fields();
    await Promise.all(fields.map((field) => field.checkField()));
    const output = await this.#checkSchema(values);
    this.#applyErrors();
    if (this.#hasErrors()) {
      fields.find((field) => field.errors.length > 0)?.control?.focus();
      return;
    }
    const detail: FormSubmitDetail = { values, output };
    const proceed = this.dispatchEvent(new CustomEvent('form-submit', { detail, bubbles: true, composed: true, cancelable: true }));
    if (!proceed || this.preventDefaultSubmit) return;
    this.#bypass = true;
    try {
      form.requestSubmit(submitter);
    } finally {
      this.#bypass = false;
    }
  };

  // Server errors clear per field as soon as its value changes. After a submit, schema issues are rechecked.
  #onChange = async (event: Event) => {
    const field = (event.target as Element | null)?.closest<TaqwaField>('taqwa-field');
    if (!field) return;
    this.#serverErrors = { ...this.#serverErrors };
    delete this.#serverErrors[field.fieldName];
    const form = field.closest('form');
    if (form && this.#submitted) await this.#checkSchema(collect(form));
    this.#applyErrors();
  };

  #onReset = () => {
    this.#submitted = false;
    this.#serverErrors = {};
    this.#schemaErrors = {};
    this.formErrors = [];
    this.#fields().forEach((field) => field.clearErrors());
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-form': TaqwaForm;
  }
}
