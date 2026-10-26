import { html, nothing, unsafeCSS, LitElement, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { animate } from 'motion';
import { isRtl, nextIndex } from './internal/a11y';
import { TaqwaFormControl } from './internal/form-control';
import { prefersReducedMotion } from './internal/motion';
import styles from './radio-group.css?inline';

const popIn = (target: Element) =>
  animate(
    target,
    { scale: [0.5, 1], opacity: [0, 1] },
    prefersReducedMotion() ? { duration: 0 } : { type: 'spring', visualDuration: 0.25, bounce: 0.3 },
  );

/**
 * Shares a single value across `taqwa-radio` children. Arrow keys move and select, Tab enters and leaves the group.
 *
 * @summary Chooses one option from a set and submits its value.
 * @fires value-change - `{ value }`. Cancelable: `preventDefault()` keeps the current selection.
 * @fires input - Dispatched after a change.
 * @fires change - Dispatched after a change.
 * @slot - `taqwa-radio` children.
 * @csspart base - The wrapper with `role="radiogroup"`.
 */
@customElement('taqwa-radio-group')
export class TaqwaRadioGroup extends TaqwaFormControl {
  static styles = unsafeCSS(styles);

  @property() value: string | null = null;
  @property({ type: Boolean, reflect: true, attribute: 'read-only' }) readOnly = false;

  #defaultValue: string | null = null;
  #onKeyDown = (event: KeyboardEvent) => {
    const radios = this.#radios();
    const current = radios.indexOf(event.target as TaqwaRadio);
    if (current < 0) return;
    const next = nextIndex(event.key, current, radios.length, {
      orientation: 'both',
      rtl: isRtl(this),
      isDisabled: (index) => radios[index].isDisabled,
    });
    if (next === undefined) return;
    event.preventDefault();
    radios[next].focus();
    this.select(radios[next].value);
  };

  get formValue() {
    return this.value;
  }

  protected get validationAnchor() {
    return this.renderRoot.querySelector<HTMLElement>('[part="base"]');
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.#onKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.#onKeyDown);
  }

  firstUpdated() {
    this.#defaultValue = this.value;
  }

  updated(changed: PropertyValues<this>) {
    const radios = this.#radios();
    const selected = radios.some((radio) => radio.value === this.value);
    const first = radios.find((radio) => !radio.isDisabled);
    radios.forEach((radio) => {
      radio.checked = radio.value === this.value;
      radio.tabbable = selected ? radio.checked : radio === first;
    });
    if (changed.has('disabled')) radios.forEach((radio) => radio.requestUpdate());
    this.#commit();
  }

  formResetCallback() {
    this.value = this.#defaultValue;
  }

  render() {
    return html`<div
      part="base"
      class="taqwa-radio-group"
      role="radiogroup"
      aria-label=${ifDefined(this.controlLabel)}
      aria-description=${ifDefined(this.controlDescription)}
      aria-invalid=${ifDefined(this.controlInvalid)}
      aria-readonly=${ifDefined(this.readOnly ? 'true' : undefined)}
      aria-required=${ifDefined(this.required ? 'true' : undefined)}
      aria-disabled=${ifDefined(this.isDisabled ? 'true' : undefined)}
    ><slot></slot></div>`;
  }

  /** @internal Called by `taqwa-radio` when it is clicked. */
  select(value: string) {
    if (this.isDisabled || this.readOnly || value === this.value) return;
    if (!this.emit('value-change', { value })) return;
    this.value = value;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  #radios() {
    return [...this.querySelectorAll<TaqwaRadio>('taqwa-radio')].filter(
      (radio) => radio.closest('taqwa-radio-group') === this,
    );
  }

  #commit() {
    const disabled = this.isDisabled;
    this.commitValue(
      disabled ? null : this.value,
      { valueMissing: this.required && this.value === null && !disabled },
      'Please select an option.',
    );
  }
}

/**
 * One option of a `taqwa-radio-group`. The whole element, including its default-slot label, selects it.
 *
 * @summary A single option inside `taqwa-radio-group`.
 * @slot - Label text.
 * @csspart base - The circle, a `<button role="radio">`.
 * @csspart indicator - The dot shown when selected.
 * @csspart label - Wraps the default slot.
 */
@customElement('taqwa-radio')
export class TaqwaRadio extends LitElement {
  static styles = unsafeCSS(styles);
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  @property({ reflect: true }) value = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Set by `taqwa-radio-group`. */
  @property({ type: Boolean, reflect: true }) checked = false;
  /** Set by `taqwa-radio-group` for roving focus. */
  @property({ attribute: false }) tabbable = false;

  #onClick = () => {
    if (!this.isDisabled) this.closest('taqwa-radio-group')?.select(this.value);
  };

  get isDisabled() {
    return this.disabled || !!this.closest('taqwa-radio-group')?.disabled;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.#onClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.#onClick);
  }

  updated(changed: PropertyValues<this>) {
    const dot = this.renderRoot.querySelector<HTMLElement>('[part="indicator"]');
    if (dot && changed.get('checked') !== undefined) popIn(dot);
  }

  render() {
    return html`<button
        part="base"
        type="button"
        class="taqwa-radio"
        role="radio"
        aria-checked=${String(this.checked)}
        aria-label=${ifDefined(this.textContent?.trim() || undefined)}
        tabindex=${this.tabbable ? 0 : -1}
        ?disabled=${this.isDisabled}
      >${this.checked ? html`<span part="indicator" class="taqwa-radio__indicator"></span>` : nothing}</button>
      <span part="label" class="taqwa-radio__label"><slot></slot></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-radio-group': TaqwaRadioGroup;
    'taqwa-radio': TaqwaRadio;
  }
}
