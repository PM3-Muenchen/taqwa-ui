import { html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { animate } from 'motion';
import { TaqwaFormControl } from './internal/form-control';
import { Check, Minus, icon } from './internal/icons';
import { prefersReducedMotion } from './internal/motion';
import styles from './checkbox.css?inline';

const popIn = (target: Element) =>
  animate(
    target,
    { scale: [0.5, 1], opacity: [0, 1] },
    prefersReducedMotion() ? { duration: 0 } : { type: 'spring', visualDuration: 0.25, bounce: 0.3 },
  );

/**
 * A single checkbox. The whole element, including its default-slot label, toggles it.
 * Inside `taqwa-checkbox-group` the group owns the submitted value.
 *
 * @summary A binary or mixed choice that submits `value` when checked.
 * @fires checked-change - `{ checked }`. Cancelable: `preventDefault()` keeps the current state.
 * @fires input - Dispatched after a change.
 * @fires change - Dispatched after a change.
 * @slot - Label text.
 * @slot indicator - Replaces the check or minus icon.
 * @csspart base - The box, a `<button role="checkbox">`.
 * @csspart indicator - Wraps the check or minus icon.
 * @csspart label - Wraps the default slot.
 */
@customElement('taqwa-checkbox')
export class TaqwaCheckbox extends TaqwaFormControl {
  static styles = unsafeCSS(styles);

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  @property({ reflect: true }) value = 'on';
  @property({ type: Boolean, reflect: true, attribute: 'read-only' }) readOnly = false;
  /** Select-all checkbox of the enclosing `taqwa-checkbox-group`. Its state follows the group's children. */
  @property({ type: Boolean, reflect: true }) parent = false;

  #defaultChecked = false;
  #onClick = () => this.#toggle();

  get formValue() {
    return this.checked;
  }

  protected get validationAnchor() {
    return this.renderRoot.querySelector<HTMLElement>('[part="base"]');
  }

  override get isDisabled() {
    return super.isDisabled || !!this.closest('taqwa-checkbox-group')?.disabled;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.#onClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.#onClick);
  }

  firstUpdated() {
    this.#defaultChecked = this.checked;
  }

  updated(changed: PropertyValues<this>) {
    const indicator = this.renderRoot.querySelector<HTMLElement>('[part="indicator"]');
    if (indicator && changed.get('checked') !== undefined) popIn(indicator);
    this.#commit();
  }

  formResetCallback() {
    if (this.closest('taqwa-checkbox-group')) return;
    this.checked = this.#defaultChecked;
  }

  render() {
    const on = this.checked || this.indeterminate;
    return html`<button
        part="base"
        type="button"
        class="taqwa-checkbox"
        role="checkbox"
        aria-checked=${this.indeterminate ? 'mixed' : String(this.checked)}
        aria-label=${ifDefined(this.controlLabel || this.textContent?.trim() || undefined)}
        aria-description=${ifDefined(this.controlDescription)}
        aria-invalid=${ifDefined(this.controlInvalid)}
        aria-readonly=${ifDefined(this.readOnly ? 'true' : undefined)}
        aria-required=${ifDefined(this.required ? 'true' : undefined)}
        ?disabled=${this.isDisabled}
      >${on
        ? html`<span part="indicator" class="taqwa-checkbox__indicator"
            ><slot name="indicator">${icon(this.indeterminate ? Minus : Check, 14)}</slot></span
          >`
        : nothing}</button>
      <span part="label" class="taqwa-checkbox__label"><slot></slot></span>`;
  }

  #commit() {
    const grouped = !!this.closest('taqwa-checkbox-group');
    const submit = this.checked && !this.isDisabled && !grouped ? this.value : null;
    this.commitValue(
      submit,
      { valueMissing: this.required && !this.checked && !this.isDisabled && !grouped },
      'Please check this box.',
    );
  }

  #toggle() {
    if (this.isDisabled || this.readOnly) return;
    const { checked, indeterminate } = this;
    this.checked = !checked;
    this.indeterminate = false;
    if (!this.emit('checked-change', { checked: this.checked })) {
      this.checked = checked;
      this.indeterminate = indeterminate;
      return;
    }
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-checkbox': TaqwaCheckbox;
  }
}
