import { html, nothing, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ChevronsUpDown, X, icon } from './internal/icons';
import {
  TaqwaListbox,
  TaqwaListboxGroup,
  TaqwaListboxItem,
  containsText,
  type ListboxOption,
  type OpenReason,
} from './select';
import listboxStyles from './select.css?inline';
import styles from './combobox.css?inline';

/** One choice in a `taqwa-combobox`. Set `value`; the text content is the label. */
@customElement('taqwa-combobox-item')
export class TaqwaComboboxItem extends TaqwaListboxItem {}

/** Labelled section of `taqwa-combobox-item`s. */
@customElement('taqwa-combobox-group')
export class TaqwaComboboxGroup extends TaqwaListboxGroup {}

/**
 * Type to filter a list of predefined items and pick one (or several with `multiple`). The value must resolve to an
 * item: leaving the field restores the selected label.
 * @summary Filterable select: an input combined with a list of predefined items.
 * @fires value-change - `{ value }`. Cancelable: `preventDefault()` keeps the current value.
 * @fires open-change - `{ open, reason }`. Cancelable.
 * @fires input - Fired while typing (native) and after the value changes.
 * @fires change - Fired after the value changes.
 * @slot empty - Shown when no item matches the query.
 * @csspart field - The bordered wrapper around chips, input and buttons.
 * @csspart chips - The chip list (`multiple` only).
 * @csspart chip - One selected chip.
 * @csspart chip-remove - The chip's remove button.
 * @csspart input - The text input.
 * @csspart clear - The clear button.
 * @csspart trigger - The chevron button that opens the popup.
 * @csspart popup - The floating glass listbox.
 * @csspart listbox - The `role="listbox"` element.
 * @csspart option - Each option.
 * @csspart group-label - Group headings.
 */
@customElement('taqwa-combobox')
export class TaqwaCombobox extends TaqwaListbox {
  static styles = [unsafeCSS(listboxStyles), unsafeCSS(styles)];

  @property({ reflect: true }) placeholder = '';
  @property({ type: Boolean, reflect: true }) multiple = false;
  @property() value: string | string[] = '';
  /** Keeps an item when `filter(label, query)` is true. `null` disables filtering. */
  @property({ attribute: false }) filter: ((label: string, query: string) => boolean) | null = containsText;

  /** Text typed since the last choice. `null` shows the selected label instead. */
  @state() private typed: string | null = null;

  protected get anchor() {
    return this.renderRoot.querySelector<HTMLElement>('.taqwa-combobox-field');
  }

  protected get validationAnchor() {
    return this.#input;
  }

  protected selectedValues() {
    return Array.isArray(this.value) ? this.value : this.value ? [this.value] : [];
  }

  protected isShown(label: string) {
    const query = this.typed ?? '';
    return !this.filter || !query || this.filter(label, query);
  }

  protected onSelect(option: ListboxOption, reason: OpenReason) {
    if (this.multiple) {
      const values = this.selectedValues();
      this.changeValue(values.includes(option.value) ? values.filter((v) => v !== option.value) : [...values, option.value]);
      this.typed = '';
      this.active = -1;
      return;
    }
    if (!this.changeValue(option.value)) return;
    this.typed = null;
    this.setOpen(false, reason);
  }

  formResetCallback() {
    super.formResetCallback();
    this.typed = null;
  }

  render() {
    const values = this.selectedValues();
    const text = this.typed ?? (this.multiple ? '' : this.labelOf(values[0] ?? ''));
    const canClear = values.length > 0 && !this.isDisabled && !this.readOnly;
    return html`
      <div
        part="field"
        class="taqwa-combobox-field"
        ?data-disabled=${this.isDisabled}
        @pointerdown=${this.#onFieldPointerdown}
      >
        ${this.multiple
          ? html`<div part="chips" class="taqwa-combobox-chips">${values.map((value) => this.#renderChip(value))}</div>`
          : nothing}
        <input
          part="input"
          class="taqwa-combobox-input"
          type="text"
          role="combobox"
          autocomplete="off"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-controls=${this.listboxId}
          aria-activedescendant=${this.activeDescendant ?? nothing}
          aria-label=${this.controlLabel ?? nothing}
          aria-description=${this.controlDescription ?? nothing}
          aria-invalid=${this.controlInvalid ?? nothing}
          aria-required=${this.required ? 'true' : nothing}
          aria-readonly=${this.readOnly ? 'true' : nothing}
          placeholder=${this.placeholder || nothing}
          .value=${text}
          ?disabled=${this.isDisabled}
          ?readonly=${this.readOnly}
          @input=${this.#onInput}
          @keydown=${this.#onKeydown}
          @blur=${this.#onBlur}
          @click=${() => this.setOpen(true, 'input-press')}
        />
        <div class="taqwa-combobox-actions">
          ${canClear
            ? html`<button
                part="clear"
                class="taqwa-combobox-button"
                type="button"
                tabindex="-1"
                aria-label="Clear"
                @click=${this.#clear}
              >
                ${icon(X)}
              </button>`
            : nothing}
          <button
            part="trigger"
            class="taqwa-combobox-button"
            type="button"
            tabindex="-1"
            aria-label="Show options"
            ?disabled=${this.isDisabled}
            @click=${this.#onTrigger}
          >
            ${icon(ChevronsUpDown)}
          </button>
        </div>
      </div>
      ${this.renderPopup()}
    `;
  }

  get #input() {
    return this.renderRoot.querySelector<HTMLInputElement>('input');
  }

  #renderChip(value: string) {
    const label = this.labelOf(value);
    return html`<span part="chip" class="taqwa-combobox-chip">
      ${label}
      <button
        part="chip-remove"
        class="taqwa-combobox-chip-remove"
        type="button"
        tabindex="-1"
        aria-label=${`Remove ${label}`}
        ?disabled=${this.isDisabled || this.readOnly}
        @click=${() => this.changeValue(this.selectedValues().filter((v) => v !== value))}
      >
        ${icon(X, '0.75em')}
      </button>
    </span>`;
  }

  // Pointer presses on the field (chips, buttons, padding) keep focus in the input.
  #onFieldPointerdown(event: PointerEvent) {
    if (event.target instanceof HTMLInputElement) return;
    event.preventDefault();
    this.#input?.focus();
  }

  #onTrigger() {
    this.#input?.focus();
    this.setOpen(!this.open, 'trigger-press');
  }

  #clear() {
    this.typed = null;
    this.changeValue(this.multiple ? [] : '');
  }

  #onInput(event: Event) {
    this.typed = (event.target as HTMLInputElement).value;
    this.setOpen(true, 'input-change');
    this.active = -1;
  }

  #onKeydown(event: KeyboardEvent) {
    if (this.readOnly) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.setOpen(true, 'keyboard');
      this.moveActive(event.key);
    } else if (event.key === 'Enter' && this.open) {
      const option = this.flatOptions[this.active];
      if (option && !option.disabled) {
        event.preventDefault();
        this.onSelect(option, 'keyboard');
      }
    } else if (event.key === 'Backspace' && this.multiple && !this.typed) {
      const values = this.selectedValues();
      if (values.length) this.changeValue(values.slice(0, -1));
    }
  }

  #onBlur() {
    this.typed = null;
    this.setOpen(false, 'focus-out');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-combobox': TaqwaCombobox;
    'taqwa-combobox-item': TaqwaComboboxItem;
    'taqwa-combobox-group': TaqwaComboboxGroup;
  }
}
