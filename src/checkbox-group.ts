import { html, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { TaqwaCheckbox } from './checkbox';
import { TaqwaFormControl } from './internal/form-control';
import styles from './checkbox-group.css?inline';

/**
 * Shares a value across the `taqwa-checkbox` children. The group submits every checked value under its `name`,
 * so its children do not submit on their own. A child with the `parent` attribute toggles all of them.
 *
 * @summary Groups checkboxes into one multi-value field.
 * @fires value-change - `{ value }` with the checked child values. Cancelable: `preventDefault()` reverts the change.
 * @fires input - Dispatched after a change.
 * @fires change - Dispatched after a change.
 * @slot - `taqwa-checkbox` children.
 * @csspart base - The wrapper with `role="group"`.
 */
@customElement('taqwa-checkbox-group')
export class TaqwaCheckboxGroup extends TaqwaFormControl {
  static styles = unsafeCSS(styles);

  /** Values of the checked children. Unset, it is read from the children's `checked` state on first render. */
  @property({ attribute: false }) value: string[] | undefined = undefined;

  #defaultValue: string[] = [];
  #onChange = (event: Event) => this.#childChanged(event.target as TaqwaCheckbox);

  get formValue() {
    return this.value ?? [];
  }

  protected get validationAnchor() {
    return this.renderRoot.querySelector<HTMLElement>('[part="base"]');
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('change', this.#onChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('change', this.#onChange);
  }

  firstUpdated() {
    const value = (this.value ??= this.#checked());
    this.#defaultValue = [...value];
  }

  updated(changed: PropertyValues<this>) {
    if (changed.has('value') && this.value) this.#sync();
    if (changed.has('disabled')) this.#items().forEach((item) => item.requestUpdate());
    this.#commit();
  }

  formResetCallback() {
    this.value = [...this.#defaultValue];
  }

  render() {
    return html`<div
      part="base"
      class="taqwa-checkbox-group"
      role="group"
      aria-label=${ifDefined(this.controlLabel)}
      aria-description=${ifDefined(this.controlDescription)}
    ><slot></slot></div>`;
  }

  #items() {
    return [...this.querySelectorAll<TaqwaCheckbox>('taqwa-checkbox')].filter(
      (item) => item.closest('taqwa-checkbox-group') === this,
    );
  }

  #children() {
    return this.#items().filter((item) => !item.parent);
  }

  #checked() {
    return this.#children().filter((item) => item.checked).map((item) => item.value);
  }

  #sync() {
    const value = this.value ?? [];
    const children = this.#children();
    children.forEach((item) => (item.checked = value.includes(item.value)));
    const all = children.length > 0 && children.every((item) => item.checked);
    const some = children.some((item) => item.checked);
    this.#items()
      .filter((item) => item.parent)
      .forEach((item) => {
        item.checked = all;
        item.indeterminate = some && !all;
      });
  }

  #childChanged(target: TaqwaCheckbox) {
    if (!this.#items().includes(target)) return;
    if (target.parent) this.#children().forEach((item) => (item.checked = target.checked));
    const next = this.#checked();
    if (!this.emit('value-change', { value: next })) return this.#sync();
    this.value = next;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  #commit() {
    const value = this.value ?? [];
    const data = new FormData();
    value.forEach((item) => data.append(this.name, item));
    const disabled = this.isDisabled;
    this.commitValue(
      disabled || !this.name ? null : data,
      { valueMissing: this.required && value.length === 0 && !disabled },
      'Please select at least one option.',
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-checkbox-group': TaqwaCheckboxGroup;
  }
}
