import { html, nothing, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  TaqwaListbox,
  TaqwaListboxGroup,
  TaqwaListboxItem,
  containsText,
  type ListboxOption,
  type OpenReason,
} from './select';
import listboxStyles from './select.css?inline';
import styles from './autocomplete.css?inline';

/** One suggestion in a `taqwa-autocomplete`. Set `value`; the text content is the label. */
@customElement('taqwa-autocomplete-item')
export class TaqwaAutocompleteItem extends TaqwaListboxItem {}

/** Labelled section of `taqwa-autocomplete-item`s. */
@customElement('taqwa-autocomplete-group')
export class TaqwaAutocompleteGroup extends TaqwaListboxGroup {}

/**
 * Free-text input with suggestions. `value` is the text in the input, which need not match any suggestion.
 * `mode="both"` also fills the input with the highlighted suggestion while navigating with the arrow keys.
 * @summary Text input that suggests matching items as you type.
 * @fires value-change - `{ value }`. Cancelable: `preventDefault()` keeps the current text.
 * @fires open-change - `{ open, reason }`. Cancelable.
 * @fires input - Fired while typing and after the value changes.
 * @fires change - Fired after the value changes.
 * @slot empty - Shown when no suggestion matches.
 * @csspart input - The text input.
 * @csspart popup - The floating glass listbox.
 * @csspart listbox - The `role="listbox"` element.
 * @csspart option - Each suggestion.
 * @csspart group-label - Group headings.
 */
@customElement('taqwa-autocomplete')
export class TaqwaAutocomplete extends TaqwaListbox {
  static styles = [unsafeCSS(listboxStyles), unsafeCSS(styles)];

  @property({ reflect: true }) placeholder = '';
  @property() value = '';
  @property({ reflect: true }) mode: 'list' | 'both' = 'list';
  /** Keeps a suggestion when `filter(label, query)` is true. `null` disables filtering. */
  @property({ attribute: false }) filter: ((label: string, query: string) => boolean) | null = containsText;

  protected readonly multiple = false;
  /** Text typed since the last keystroke; `null` filters by `value` instead. */
  @state() private typed: string | null = null;

  protected get anchor() {
    return this.#input;
  }

  protected get validationAnchor() {
    return this.#input;
  }

  protected selectedValues() {
    return this.value ? [this.value] : [];
  }

  protected isSelected() {
    return false;
  }

  protected isShown(label: string) {
    const query = this.typed ?? this.value;
    return !this.filter || !query || this.filter(label, query);
  }

  protected onSelect(option: ListboxOption, reason: OpenReason) {
    if (!this.changeValue(option.label)) return;
    this.typed = null;
    this.setOpen(false, reason);
  }

  formResetCallback() {
    super.formResetCallback();
    this.typed = null;
  }

  render() {
    return html`
      <input
        part="input"
        class="taqwa-autocomplete-input"
        type="text"
        role="combobox"
        autocomplete="off"
        aria-autocomplete=${this.mode}
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
        .value=${this.value}
        ?disabled=${this.isDisabled}
        ?readonly=${this.readOnly}
        @input=${this.#onInput}
        @keydown=${this.#onKeydown}
        @blur=${this.#onBlur}
        @click=${() => this.setOpen(true, 'input-press')}
      />
      ${this.renderPopup()}
    `;
  }

  get #input() {
    return this.renderRoot.querySelector<HTMLInputElement>('input');
  }

  // Typing goes through `changeValue` so `value-change` can cancel it; the native `input` is replaced by the one it fires.
  #onInput(event: Event) {
    event.stopPropagation();
    const text = (event.target as HTMLInputElement).value;
    this.typed = text;
    this.changeValue(text);
    this.setOpen(true, 'input-change');
    this.active = -1;
  }

  #onKeydown(event: KeyboardEvent) {
    if (this.readOnly) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.typed ??= this.value;
      this.setOpen(true, 'keyboard');
      if (this.moveActive(event.key) && this.mode === 'both') {
        const option = this.flatOptions[this.active];
        if (option) this.changeValue(option.label);
      }
    } else if (event.key === 'Enter' && this.open) {
      const option = this.flatOptions[this.active];
      if (option && !option.disabled) {
        event.preventDefault();
        this.onSelect(option, 'keyboard');
      }
    }
  }

  #onBlur() {
    this.typed = null;
    this.setOpen(false, 'focus-out');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-autocomplete': TaqwaAutocomplete;
    'taqwa-autocomplete-item': TaqwaAutocompleteItem;
    'taqwa-autocomplete-group': TaqwaAutocompleteGroup;
  }
}
