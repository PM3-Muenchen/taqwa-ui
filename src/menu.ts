import { LitElement, html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ReferenceElement } from '@floating-ui/dom';
import { animateGlass, animatePopupIn, animatePopupOut, type Side } from './internal/motion';
import { anchorPopup, onDismiss, type Placement } from './internal/popup';
import { isRtl, nextIndex, typeahead, uid } from './internal/a11y';
import { Check, ChevronRight, icon } from './internal/icons';
import styles from './menu.css?inline';

/** Why a menu opened or closed. Cancel `open-change` to keep it as it was. */
export type MenuOpenReason =
  | 'trigger-press'
  | 'trigger-hover'
  | 'escape-key'
  | 'outside-press'
  | 'list-navigation'
  | 'sibling-open'
  | 'item-press'
  | 'focus-out'
  | 'none';

/** Where focus goes when a menu opens. */
export type MenuFocus = 'popup' | 'first' | 'last' | 'none';

type MenuItemLike = HTMLElement & { label?: string };

export const MENU_SELECTOR = 'taqwa-menu, taqwa-context-menu';
const ITEM_SELECTOR = 'taqwa-menu-item, taqwa-menu-checkbox-item, taqwa-menu-radio-item';
const RESTORE_FOCUS: MenuOpenReason[] = ['trigger-press', 'escape-key', 'list-navigation', 'item-press', 'focus-out'];

const emit = (target: HTMLElement, name: string, detail: object) =>
  target.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true }));

/** Menu that owns an item. A submenu's trigger sits inside the submenu but belongs to the parent. */
const ownerOf = (item: Element) =>
  (item.getAttribute('slot') === 'trigger'
    ? item.closest(MENU_SELECTOR)?.parentElement?.closest(MENU_SELECTOR)
    : item.closest(MENU_SELECTOR)) as TaqwaMenuBase | null | undefined;

/**
 * Popup, keyboard and focus behaviour shared by `taqwa-menu` and `taqwa-context-menu`. Not registered itself.
 * Subclasses render `renderPopup()` and provide the element the popup is anchored to.
 */
export abstract class TaqwaMenuBase extends LitElement {
  /** Whether the menu is showing. Reflected so the host can be styled with `:host([open])`. */
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Opens on pointer hover (mouse and pen). Submenus always do. */
  @property({ type: Boolean, attribute: 'open-on-hover' }) openOnHover = false;

  #focus: MenuFocus = 'popup';
  #ac?: AbortController;
  #unbindAnchor?: VoidFunction;
  #unbindDismiss?: VoidFunction;
  #hoverTimer?: ReturnType<typeof setTimeout>;
  #typeahead = typeahead(() => this.#items().map((el) => (el as MenuItemLike).label || el.textContent || ''));

  get #popup() {
    return this.renderRoot.querySelector<HTMLElement>('.taqwa-menu-popup')!;
  }

  get #side() {
    return this.placement.split('-')[0] as Side;
  }

  /** Parent menu when this one is a submenu. */
  get parentMenu(): TaqwaMenuBase | null {
    return (this.parentElement?.closest(MENU_SELECTOR) as TaqwaMenuBase | null | undefined) ?? null;
  }

  /** Element the popup is anchored to. */
  protected abstract anchor(): ReferenceElement | null;

  /** Trigger in the light DOM (`slot="trigger"`). Gets `aria-expanded` and receives focus back on keyboard close. */
  protected get triggerEl(): HTMLElement | null {
    return this.querySelector(':scope > [slot="trigger"]');
  }

  protected get placement(): Placement {
    return this.parentMenu ? (isRtl(this) ? 'left-start' : 'right-start') : 'bottom-start';
  }

  /** Opens the menu. `focus` says where focus goes. Cancel `open-change` to keep it closed. */
  show(focus: MenuFocus = 'popup', reason: MenuOpenReason = 'none') {
    if (this.disabled || this.open || !emit(this, 'open-change', { open: true, reason })) return;
    this.#focus = focus;
    this.open = true;
  }

  /** Closes the menu. Cancel `open-change` to keep it open. */
  hide(reason: MenuOpenReason = 'none') {
    if (!this.open || !emit(this, 'open-change', { open: false, reason })) return;
    if (RESTORE_FOCUS.includes(reason)) this.triggerEl?.focus();
    this.open = false;
  }

  /** Closes this menu and every menu it is nested in. Items call this once they are chosen. */
  dismiss(reason: MenuOpenReason) {
    this.hide(reason);
    if (!this.open) this.parentMenu?.dismiss(reason);
  }

  /** Positions the popup against `anchor()`. Call again when the anchor moves. */
  protected place() {
    this.#unbindAnchor?.();
    const reference = this.anchor();
    if (reference) this.#unbindAnchor = anchorPopup(reference, this.#popup, { placement: this.placement, offset: 4 });
  }

  protected renderPopup() {
    return html`<div
      class="taqwa-menu-popup"
      part="popup"
      popover="manual"
      role="menu"
      tabindex="-1"
      @keydown=${this.#onKeydown}
      @focusin=${this.#onFocusin}
    ><slot></slot></div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.toggleAttribute('submenu', !!this.parentMenu);
    this.#ac = new AbortController();
    const { signal } = this.#ac;
    this.addEventListener('pointerenter', this.#onPointerEnter, { signal });
    this.addEventListener('pointerleave', this.#onPointerLeave, { signal });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#ac?.abort();
    clearTimeout(this.#hoverTimer);
    this.#unbindDismiss?.();
    this.#unbindDismiss = undefined;
    this.#unbindAnchor?.();
    if (this.#popup.matches(':popover-open')) this.#popup.hidePopover();
  }

  protected updated(changed: PropertyValues) {
    if (changed.has('open')) this.#sync();
  }

  #items(): HTMLElement[] {
    return [...this.querySelectorAll<HTMLElement>(ITEM_SELECTOR)].filter((el) => ownerOf(el) === this);
  }

  #sync() {
    const popup = this.#popup;
    this.triggerEl?.setAttribute('aria-haspopup', 'menu');
    this.triggerEl?.setAttribute('aria-expanded', String(this.open));
    if (this.open) {
      if (!popup.matches(':popover-open')) popup.showPopover();
      this.place();
      animatePopupIn(popup, this.#side);
      this.#unbindDismiss ??= onDismiss(
        () => [this, popup],
        (how) => this.hide(how === 'outside' ? 'outside-press' : 'escape-key'),
      );
      const items = this.#items().filter((el) => !el.hasAttribute('disabled'));
      const target = { first: items[0], last: items.at(-1), popup, none: undefined }[this.#focus];
      target?.focus();
    } else if (popup.matches(':popover-open')) {
      this.#unbindDismiss?.();
      this.#unbindDismiss = undefined;
      this.#unbindAnchor?.();
      animatePopupOut(popup, this.#side).then(() => {
        if (!this.open) popup.hidePopover();
      });
    }
  }

  #onKeydown = (event: KeyboardEvent) => {
    const { key } = event;
    if (key === 'Tab') {
      this.hide('focus-out');
      return;
    }

    const items = this.#items();
    const item = items.find((el) => event.composedPath().includes(el));
    const index = item ? items.indexOf(item) : -1;
    const rtl = isRtl(this);
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';

    if (key === 'Escape' || (key === back && this.parentMenu)) {
      event.preventDefault();
      event.stopPropagation();
      this.hide(key === 'Escape' ? 'escape-key' : 'list-navigation');
      return;
    }

    if (item?.slot === 'trigger' && (key === forward || key === 'Enter' || key === ' ')) {
      event.preventDefault();
      event.stopPropagation();
      (item.parentElement as TaqwaMenuBase).show('first', 'trigger-press');
      return;
    }

    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      if (item && !item.hasAttribute('disabled')) item.click();
      return;
    }

    const from = key === 'ArrowUp' && index < 0 ? items.length : index;
    const next = nextIndex(key, from, items.length, {
      orientation: 'vertical',
      rtl,
      isDisabled: (i) => items[i].hasAttribute('disabled'),
    });
    if (next !== undefined && items[next]) {
      event.preventDefault();
      event.stopPropagation();
      items[next].focus();
      return;
    }

    if (key.length === 1) {
      const match = this.#typeahead(key, index);
      if (match !== undefined) {
        event.stopPropagation();
        items[match].focus();
      }
    }
  };

  // Keeps only one submenu open: focusing a row closes the submenus that are not on it.
  #onFocusin = (event: FocusEvent) => {
    const items = this.#items();
    const item = items.find((el) => event.composedPath().includes(el));
    if (!item) return;
    for (const el of items) {
      if (el.slot === 'trigger' && el !== item) (el.parentElement as TaqwaMenuBase).hide();
    }
  };

  #onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || !(this.openOnHover || this.parentMenu)) return;
    clearTimeout(this.#hoverTimer);
    this.show('none', 'trigger-hover');
  };

  #onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || !(this.openOnHover || this.parentMenu)) return;
    clearTimeout(this.#hoverTimer);
    this.#hoverTimer = setTimeout(() => this.hide('trigger-hover'), 150);
  };
}

/** Row inside a menu. Choosing it fires `select` and closes the menu unless `close-on-click="false"`. */
export class TaqwaMenuItemBase extends LitElement {
  static styles = unsafeCSS(styles);

  /** Reported in `select` and used to match radio groups. */
  @property() value = '';
  /** Text for type-to-select. Defaults to the item's text. */
  @property() label = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Closes the menu when chosen. `close-on-click="false"` keeps it open. */
  @property({ attribute: 'close-on-click', converter: { fromAttribute: (value: string | null) => value !== 'false' } })
  closeOnClick = true;

  protected readonly internals = this.attachInternals();
  protected itemRole = 'menuitem';
  #ac?: AbortController;

  get #base() {
    return this.renderRoot.querySelector<HTMLElement>('.taqwa-menu-item')!;
  }

  connectedCallback() {
    super.connectedCallback();
    this.internals.role = this.itemRole;
    this.tabIndex = -1;
    this.#ac = new AbortController();
    const { signal } = this.#ac;
    this.addEventListener('click', this.#onClick, { signal });
    this.addEventListener('focus', this.#onFocus, { signal });
    this.addEventListener('blur', this.#onBlur, { signal });
    this.addEventListener('pointerenter', this.#onEnter, { signal });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#ac?.abort();
  }

  protected updated() {
    this.internals.ariaDisabled = String(this.disabled);
  }

  /** Content of the leading indicator slot (check mark, dot). */
  protected indicator(): unknown {
    return nothing;
  }

  /** What a choice does. Subclasses override it. */
  protected choose() {
    if (emit(this, 'select', { value: this.value })) this.afterChoose();
  }

  protected afterChoose() {
    if (this.closeOnClick) ownerOf(this)?.dismiss('item-press');
  }

  #onClick = () => {
    if (!this.disabled && this.slot !== 'trigger') this.choose();
  };

  #onFocus = () => {
    if (!this.disabled) animateGlass(this.#base, 1);
  };

  #onBlur = () => {
    animateGlass(this.#base, 0);
  };

  #onEnter = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && !this.disabled) this.focus({ preventScroll: true });
  };

  render() {
    return html`<div class="taqwa-menu-item" part="base">
      <span class="taqwa-menu-indicator" part="indicator">${this.indicator()}</span>
      <span class="taqwa-menu-label" part="label"><slot></slot></span>
      ${this.slot === 'trigger'
        ? html`<span class="taqwa-menu-chevron" part="chevron">${icon(ChevronRight, 16)}</span>`
        : nothing}
    </div>`;
  }
}

/**
 * Action row in a `taqwa-menu`.
 * @summary Menu action item.
 * @fires select - `{ value }` when chosen. Cancel to keep the menu open.
 * @csspart base - The row.
 * @csspart indicator - Leading slot for checks and dots.
 * @csspart label - The item text.
 * @csspart chevron - Shown on submenu triggers.
 */
@customElement('taqwa-menu-item')
export class TaqwaMenuItem extends TaqwaMenuItemBase {}

/**
 * Menu row that toggles a setting. Stays open by default.
 * @summary Checkable menu item.
 * @fires checked-change - `{ checked }`. Cancel to keep the previous state.
 * @csspart base - The row.
 */
@customElement('taqwa-menu-checkbox-item')
export class TaqwaMenuCheckboxItem extends TaqwaMenuItemBase {
  @property({ type: Boolean, reflect: true }) checked = false;

  constructor() {
    super();
    this.itemRole = 'menuitemcheckbox';
    this.closeOnClick = false;
  }

  protected updated() {
    super.updated();
    this.internals.ariaChecked = String(this.checked);
  }

  protected indicator(): unknown {
    return this.checked ? icon(Check, 16) : nothing;
  }

  protected choose() {
    const checked = !this.checked;
    if (!emit(this, 'checked-change', { checked })) return;
    this.checked = checked;
    this.afterChoose();
  }
}

/**
 * Menu row inside a `taqwa-menu-radio-group`.
 * @summary Radio menu item.
 * @csspart base - The row.
 */
@customElement('taqwa-menu-radio-item')
export class TaqwaMenuRadioItem extends TaqwaMenuItemBase {
  /** Set by the parent radio group. */
  @property({ type: Boolean, reflect: true }) checked = false;

  constructor() {
    super();
    this.itemRole = 'menuitemradio';
    this.closeOnClick = false;
  }

  protected updated() {
    super.updated();
    this.internals.ariaChecked = String(this.checked);
  }

  protected indicator(): unknown {
    return this.checked ? html`<span class="taqwa-menu-dot"></span>` : nothing;
  }

  protected choose() {
    (this.closest('taqwa-menu-radio-group') as TaqwaMenuRadioGroup | null)?.select(this.value);
    this.afterChoose();
  }
}

/**
 * Labelled set of menu items. The label goes in a `slot="label"` child.
 * @summary Group of menu items.
 * @slot label - Group heading.
 * @slot - Items.
 */
@customElement('taqwa-menu-group')
export class TaqwaMenuGroup extends LitElement {
  static styles = unsafeCSS(styles);

  protected readonly internals = this.attachInternals();

  connectedCallback() {
    super.connectedCallback();
    this.internals.role = 'group';
  }

  firstUpdated() {
    const label = this.querySelector<HTMLElement>(':scope > [slot="label"]');
    if (label) {
      label.id ||= uid('taqwa-menu-label');
      this.setAttribute('aria-labelledby', label.id);
    }
  }

  render() {
    return html`<slot name="label"></slot><slot></slot>`;
  }
}

/**
 * Group of radio items with one selected `value`.
 * @summary Radio group for menu items.
 * @fires value-change - `{ value }`. Cancel to keep the previous selection.
 * @slot label - Group heading.
 * @slot - Radio items.
 */
@customElement('taqwa-menu-radio-group')
export class TaqwaMenuRadioGroup extends TaqwaMenuGroup {
  /** Value of the selected radio item. */
  @property() value = '';

  protected updated(changed: PropertyValues) {
    if (!changed.has('value')) return;
    for (const item of this.querySelectorAll<TaqwaMenuRadioItem>('taqwa-menu-radio-item')) {
      item.checked = item.value === this.value;
    }
  }

  /** Selects `value` unless `value-change` is canceled. */
  select(value: string) {
    if (value === this.value || !emit(this, 'value-change', { value })) return;
    this.value = value;
  }
}

/**
 * Horizontal rule between menu items.
 * @summary Menu separator.
 * @csspart separator - The rule.
 */
@customElement('taqwa-menu-separator')
export class TaqwaMenuSeparator extends LitElement {
  static styles = unsafeCSS(styles);

  protected readonly internals = this.attachInternals();

  connectedCallback() {
    super.connectedCallback();
    this.internals.role = 'separator';
  }

  render() {
    return html`<div class="taqwa-menu-separator" part="separator"></div>`;
  }
}

/**
 * Dropdown menu: a trigger that opens a frosted list of items. Nest a `taqwa-menu` inside to make a submenu.
 * @summary Dropdown menu with keyboard navigation.
 * @fires open-change - `{ open, reason }`. Cancel to keep the menu as it is.
 * @slot trigger - Element that opens the menu (usually `taqwa-button`).
 * @slot - Items, groups, separators and submenus.
 * @csspart trigger - Wraps the trigger.
 * @csspart popup - The floating list.
 */
@customElement('taqwa-menu')
export class TaqwaMenu extends TaqwaMenuBase {
  static styles = unsafeCSS(styles);

  protected anchor() {
    return this.renderRoot.querySelector<HTMLElement>('.taqwa-menu-trigger');
  }

  render() {
    return html`<span class="taqwa-menu-trigger" part="trigger" @click=${this.#onTrigger} @keydown=${this.#onTriggerKey}><slot name="trigger"></slot></span>${this.renderPopup()}`;
  }

  #onTrigger = () => {
    if (this.parentMenu) this.show('none', 'trigger-press');
    else if (this.open) this.hide('trigger-press');
    else this.show('popup', 'trigger-press');
  };

  // Enter and Space reach the trigger as a click, so only the arrow keys are handled here.
  #onTriggerKey = (event: KeyboardEvent) => {
    if (this.parentMenu || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
    event.preventDefault();
    this.show(event.key === 'ArrowDown' ? 'first' : 'last', 'trigger-press');
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-menu': TaqwaMenu;
    'taqwa-menu-item': TaqwaMenuItem;
    'taqwa-menu-checkbox-item': TaqwaMenuCheckboxItem;
    'taqwa-menu-radio-item': TaqwaMenuRadioItem;
    'taqwa-menu-radio-group': TaqwaMenuRadioGroup;
    'taqwa-menu-group': TaqwaMenuGroup;
    'taqwa-menu-separator': TaqwaMenuSeparator;
  }
}
