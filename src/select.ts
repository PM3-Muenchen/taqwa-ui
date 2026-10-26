import { LitElement, css, html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { nextIndex, typeahead, uid } from './internal/a11y';
import { TaqwaFormControl } from './internal/form-control';
import { Check, ChevronsUpDown, icon } from './internal/icons';
import { animateGlass, animatePopupIn, animatePopupOut, bindGlassMotion, type Side } from './internal/motion';
import { anchorPopup, onDismiss } from './internal/popup';
import styles from './select.css?inline';

export type OpenReason =
  | 'trigger-press'
  | 'input-press'
  | 'input-change'
  | 'item-press'
  | 'keyboard'
  | 'focus-out'
  | 'escape-key'
  | 'outside-press';

export interface ListboxOption {
  value: string;
  label: string;
  disabled: boolean;
}

export interface ListboxGroup {
  label?: string;
  options: ListboxOption[];
}

const hidden = css`
  :host {
    display: none;
  }
`;

const collator = new Intl.Collator(undefined, { sensitivity: 'base' });

/** Default combobox/autocomplete filter: case- and accent-insensitive substring match. */
export const containsText = (label: string, query: string) => {
  for (let i = 0; i + query.length <= label.length; i++) {
    if (collator.compare(label.slice(i, i + query.length), query) === 0) return true;
  }
  return false;
};

const toOption = (item: TaqwaListboxItem): ListboxOption => ({
  value: item.value,
  label: item.text,
  disabled: item.disabled,
});
const isChar = (key: string) => key.length === 1 && key !== ' ';

/**
 * Data-only child of a listbox. The parent draws it inside its own popup (so focus and `aria-activedescendant`
 * stay in one shadow root), so the item itself never renders.
 */
export abstract class TaqwaListboxItem extends LitElement {
  static styles = hidden;

  @property({ reflect: true }) value = '';
  @property({ reflect: true }) label = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Label shown and filtered: `label`, else the text content. */
  get text() {
    return this.label || this.textContent?.trim() || this.value;
  }

  render() {
    return nothing;
  }
}

/** Heading and grouping for listbox items. Items nested inside are listed under `label`. */
export abstract class TaqwaListboxGroup extends LitElement {
  static styles = hidden;

  @property({ reflect: true }) label = '';

  render() {
    return nothing;
  }
}

/** Shared popup, option and keyboard logic for `taqwa-select`, `taqwa-combobox` and `taqwa-autocomplete`. */
export abstract class TaqwaListbox extends TaqwaFormControl {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean, reflect: true }) readOnly = false;

  protected abstract value: string | string[];
  protected abstract readonly multiple: boolean;
  @state() protected optionGroups: ListboxGroup[] = [];
  /** Index into `flatOptions` of the highlighted option, or -1. */
  @state() protected active = -1;

  protected readonly listboxId = uid('taqwa-listbox');
  #observer?: MutationObserver;
  #initial: string | string[] = '';
  #unanchor?: VoidFunction;
  #undismiss?: VoidFunction;
  #side: Side = 'bottom';

  protected abstract get anchor(): HTMLElement | null | undefined;
  protected abstract selectedValues(): string[];
  protected abstract onSelect(option: ListboxOption, reason: OpenReason): void;

  get formValue(): string | string[] | null {
    const values = this.selectedValues();
    return this.multiple ? values : (values[0] ?? null);
  }

  connectedCallback() {
    super.connectedCallback();
    this.#observer ??= new MutationObserver(() => this.#collect());
    this.#observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['value', 'label', 'disabled'],
    });
    this.#collect();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#observer?.disconnect();
    this.#unanchor?.();
    this.#undismiss?.();
  }

  protected firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);
    this.#initial = Array.isArray(this.value) ? [...this.value] : this.value;
  }

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    if (changed.has('open')) this.#syncPopup();
    if (changed.has('active')) this.#syncActive();
    if (changed.has('value') || changed.has('multiple') || changed.has('required')) this.#syncForm();
  }

  formResetCallback() {
    this.value = Array.isArray(this.#initial) ? [...this.#initial] : this.#initial;
    this.active = -1;
    this.open = false;
  }

  /** Flattened options after filtering; `active` indexes into this list. */
  protected get flatOptions(): ListboxOption[] {
    return this.visibleGroups.flatMap((group) => group.options);
  }

  protected get visibleGroups(): ListboxGroup[] {
    return this.optionGroups
      .map((group) => ({ label: group.label, options: group.options.filter((option) => this.isShown(option.label)) }))
      .filter((group) => group.options.length > 0);
  }

  protected get activeDescendant() {
    return this.open && this.active >= 0 && this.active < this.flatOptions.length ? this.#optionId(this.active) : undefined;
  }

  protected labelOf(value: string) {
    const options = this.optionGroups.flatMap((group) => group.options);
    return options.find((option) => option.value === value)?.label ?? value;
  }

  protected isSelected(value: string) {
    return this.selectedValues().includes(value);
  }

  /** Whether an option stays visible under the current search. Filtering subclasses override this. */
  protected isShown(_label: string) {
    return true;
  }

  /** Highlight to start on when the popup opens. */
  protected initialActive() {
    return -1;
  }

  protected setOpen(open: boolean, reason: OpenReason) {
    if (open === this.open || (open && (this.isDisabled || this.readOnly))) return;
    if (!this.emit('open-change', { open, reason })) return;
    this.active = open ? this.initialActive() : -1;
    this.open = open;
  }

  /** Moves the highlight with arrow, Home and End keys. Returns false when the key is not navigation. */
  protected moveActive(key: string) {
    const options = this.flatOptions;
    const from = this.active < 0 && key === 'ArrowUp' ? options.length : this.active;
    const next = nextIndex(key, from, options.length, {
      orientation: 'vertical',
      isDisabled: (index) => options[index].disabled,
    });
    if (next === undefined) return false;
    this.active = next;
    return true;
  }

  /** Sets the value unless `value-change` is cancelled, then fires native-like `input` and `change`. */
  protected changeValue(value: string | string[]) {
    if (!this.emit('value-change', { value })) return false;
    this.value = value;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  protected renderPopup() {
    const groups = this.visibleGroups;
    let index = 0;
    return html`
      <div part="popup" class="taqwa-listbox-popup" popover="manual">
        <div
          part="listbox"
          id=${this.listboxId}
          role="listbox"
          class="taqwa-listbox"
          aria-multiselectable=${this.multiple ? 'true' : nothing}
        >
          ${groups.map(
            (group) => html`
              <div role=${group.label === undefined ? 'presentation' : 'group'} aria-label=${group.label ?? nothing}>
                ${group.label ? html`<div part="group-label" class="taqwa-group-label">${group.label}</div>` : nothing}
                ${group.options.map((option) => this.#renderOption(option, index++))}
              </div>
            `,
          )}
          <div class="taqwa-empty" ?hidden=${groups.length > 0}><slot name="empty">No results found.</slot></div>
        </div>
      </div>
    `;
  }

  #renderOption(option: ListboxOption, index: number) {
    const selected = this.isSelected(option.value);
    return html`
      <div
        part="option"
        id=${this.#optionId(index)}
        role="option"
        class="taqwa-option"
        data-index=${index}
        aria-selected=${selected ? 'true' : 'false'}
        aria-disabled=${option.disabled ? 'true' : nothing}
        ?data-selected=${selected}
        ?data-disabled=${option.disabled}
        @pointerenter=${() => {
          if (!option.disabled) this.active = index;
        }}
        @pointerdown=${(event: Event) => event.preventDefault()}
        @click=${() => {
          if (!option.disabled) this.onSelect(option, 'item-press');
        }}
      >
        <span class="taqwa-option-indicator" aria-hidden="true">${selected ? icon(Check) : nothing}</span>
        <span class="taqwa-option-label">${option.label}</span>
      </div>
    `;
  }

  #optionId(index: number) {
    return `${this.listboxId}-option-${index}`;
  }

  #collect() {
    const groups: ListboxGroup[] = [];
    for (const child of this.children) {
      if (child instanceof TaqwaListboxGroup) {
        const options = [...child.children].flatMap((el) => (el instanceof TaqwaListboxItem ? [toOption(el)] : []));
        groups.push({ label: child.label, options });
      } else if (child instanceof TaqwaListboxItem) {
        let last = groups[groups.length - 1];
        if (!last || last.label !== undefined) {
          last = { options: [] };
          groups.push(last);
        }
        last.options.push(toOption(child));
      }
    }
    this.optionGroups = groups;
  }

  #syncPopup() {
    const popup = this.renderRoot.querySelector<HTMLElement>('.taqwa-listbox-popup');
    const anchor = this.anchor;
    if (!popup || !anchor) return;
    if (this.open) {
      if (!popup.matches(':popover-open')) popup.showPopover();
      this.#unanchor = anchorPopup(anchor, popup, { matchWidth: true, onSide: (side) => (this.#side = side) });
      this.#undismiss = onDismiss(
        () => [popup, anchor],
        (reason) => this.setOpen(false, reason === 'escape' ? 'escape-key' : 'outside-press'),
      );
      animatePopupIn(popup, this.#side);
    } else if (popup.matches(':popover-open')) {
      this.#unanchor?.();
      this.#undismiss?.();
      animatePopupOut(popup, this.#side).then(() => {
        if (!this.open && popup.matches(':popover-open')) popup.hidePopover();
      });
    }
  }

  #syncActive() {
    this.renderRoot.querySelectorAll<HTMLElement>('.taqwa-option').forEach((el, index) => {
      const level = index === this.active ? 1 : 0;
      if (el.dataset.glass === String(level)) return;
      el.dataset.glass = String(level);
      animateGlass(el, level);
    });
    this.renderRoot.querySelector(`.taqwa-option[data-index="${this.active}"]`)?.scrollIntoView({ block: 'nearest' });
  }

  #syncForm() {
    const value = this.formValue;
    const payload = Array.isArray(value)
      ? value.reduce((data, item) => {
          data.append(this.name, item);
          return data;
        }, new FormData())
      : value;
    this.commitValue(payload, { valueMissing: this.required && this.selectedValues().length === 0 });
  }
}

/** One choice in a `taqwa-select`. Set `value`; the text content is the label. */
@customElement('taqwa-select-item')
export class TaqwaSelectItem extends TaqwaListboxItem {}

/** Labelled section of `taqwa-select-item`s. */
@customElement('taqwa-select-group')
export class TaqwaSelectGroup extends TaqwaListboxGroup {}

/**
 * Pick one predefined value (or several with `multiple`) from a popup list.
 * @summary Dropdown that selects one or more predefined values from `taqwa-select-item`s.
 * @fires value-change - `{ value }`. Cancelable: `preventDefault()` keeps the current value.
 * @fires open-change - `{ open, reason }`. Cancelable.
 * @fires input - Fired after the value changes.
 * @fires change - Fired after the value changes.
 * @slot icon - Replaces the chevron icon.
 * @slot empty - Shown when there are no matching options.
 * @csspart trigger - The button that opens the popup.
 * @csspart value - The selected label or placeholder.
 * @csspart icon - The chevron wrapper.
 * @csspart popup - The floating glass listbox.
 * @csspart listbox - The `role="listbox"` element.
 * @csspart option - Each option.
 * @csspart group-label - Group headings.
 */
@customElement('taqwa-select')
export class TaqwaSelect extends TaqwaListbox {
  static styles = unsafeCSS(styles);

  @property({ reflect: true }) placeholder = '';
  @property({ type: Boolean, reflect: true }) multiple = false;
  @property() value: string | string[] = '';

  #unbindMotion?: VoidFunction;
  #search = typeahead(() => this.flatOptions.map((option) => option.label));

  protected get anchor() {
    return this.renderRoot.querySelector<HTMLElement>('.taqwa-select-trigger');
  }

  protected get validationAnchor() {
    return this.anchor;
  }

  protected selectedValues() {
    return Array.isArray(this.value) ? this.value : this.value ? [this.value] : [];
  }

  protected initialActive() {
    const options = this.flatOptions;
    const selected = options.findIndex((option) => this.isSelected(option.value));
    return selected >= 0 ? selected : options.findIndex((option) => !option.disabled);
  }

  protected onSelect(option: ListboxOption, reason: OpenReason) {
    if (!this.multiple) {
      if (this.changeValue(option.value)) this.setOpen(false, reason);
      return;
    }
    const values = this.selectedValues();
    this.changeValue(values.includes(option.value) ? values.filter((v) => v !== option.value) : [...values, option.value]);
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this.#bindMotion();
  }

  protected firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);
    this.#bindMotion();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#unbindMotion?.();
  }

  render() {
    const labels = this.selectedValues().map((value) => this.labelOf(value));
    return html`
      <button
        part="trigger"
        class="taqwa-select-trigger"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded=${this.open ? 'true' : 'false'}
        aria-controls=${this.listboxId}
        aria-activedescendant=${this.activeDescendant ?? nothing}
        aria-label=${this.controlLabel ?? nothing}
        aria-description=${this.controlDescription ?? nothing}
        aria-invalid=${this.controlInvalid ?? nothing}
        aria-required=${this.required ? 'true' : nothing}
        ?disabled=${this.isDisabled}
        @click=${this.#onClick}
        @keydown=${this.#onKeydown}
      >
        <span part="value" class="taqwa-select-value" ?data-placeholder=${labels.length === 0}>
          ${labels.length ? labels.join(', ') : this.placeholder}
        </span>
        <span part="icon" class="taqwa-select-icon"><slot name="icon">${icon(ChevronsUpDown)}</slot></span>
      </button>
      ${this.renderPopup()}
    `;
  }

  #bindMotion() {
    this.#unbindMotion = bindGlassMotion(this.renderRoot.querySelector<HTMLElement>('.taqwa-select-trigger')!, {
      disabled: () => this.isDisabled,
    });
  }

  #onClick() {
    this.setOpen(!this.open, 'trigger-press');
  }

  // Focus stays on the trigger; the highlighted option is announced through aria-activedescendant (APG select-only).
  #onKeydown(event: KeyboardEvent) {
    if (this.isDisabled) return;
    if (!this.open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.setOpen(true, 'keyboard');
      } else if (isChar(event.key) && !this.multiple && !this.readOnly) {
        const index = this.#search(event.key, this.initialActive());
        const option = index === undefined ? undefined : this.flatOptions[index];
        if (option && !option.disabled) this.onSelect(option, 'keyboard');
      }
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = this.flatOptions[this.active];
      if (option && !option.disabled) this.onSelect(option, 'keyboard');
      else this.setOpen(false, 'keyboard');
    } else if (event.key === 'Tab') {
      this.setOpen(false, 'keyboard');
    } else if (this.moveActive(event.key)) {
      event.preventDefault();
    } else if (isChar(event.key)) {
      const index = this.#search(event.key, this.active);
      if (index !== undefined) this.active = index;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-select': TaqwaSelect;
    'taqwa-select-item': TaqwaSelectItem;
    'taqwa-select-group': TaqwaSelectGroup;
  }
}
