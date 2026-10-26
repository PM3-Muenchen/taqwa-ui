import { LitElement, html, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { isRtl, nextIndex, type Orientation } from './internal/a11y';
import styles from './toolbar.css?inline';

const ITEMS = 'taqwa-toggle, taqwa-button, button, a[href], input, select, textarea';
const isDisabled = (el?: Element) => el?.closest('[disabled]') != null;
const focusTarget = (el: HTMLElement) => el.shadowRoot?.querySelector<HTMLElement>('[part~="base"]') ?? el;

/**
 * Keyboard-navigable bar for related controls. Arrow keys move focus between items (roving tabindex).
 * @summary Groups buttons, toggles and links with arrow-key navigation.
 * @slot - Items, `taqwa-toolbar-group` and `taqwa-toolbar-separator` elements.
 * @csspart base - The glass bar wrapping the slot.
 */
@customElement('taqwa-toolbar')
export class TaqwaToolbar extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ reflect: true }) orientation: Orientation = 'horizontal';
  @property({ attribute: 'loop-focus', converter: { fromAttribute: (value: string | null) => value !== 'false' } })
  loopFocus = true;

  #internals = this.attachInternals();
  #current = 0;

  render() {
    return html`<div part="base" class="taqwa-toolbar"><slot @slotchange=${this.#sync}></slot></div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.#internals.role = 'toolbar';
    this.addEventListener('keydown', this.#onKeydown);
    this.addEventListener('focusin', this.#onFocusin);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.#onKeydown);
    this.removeEventListener('focusin', this.#onFocusin);
  }

  firstUpdated() {
    this.#sync();
  }

  updated(changed: PropertyValues) {
    if (changed.has('orientation')) this.#internals.ariaOrientation = this.orientation;
  }

  #items() {
    return [...this.querySelectorAll<HTMLElement>(ITEMS)];
  }

  #onKeydown = (event: KeyboardEvent) => {
    const target = event.target as Node;
    const items = this.#items();
    const index = items.findIndex((el) => el.contains(target));
    // Arrows move the text cursor inside text fields.
    if (index < 0 || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
    const next = nextIndex(event.key, index, items.length, {
      orientation: this.orientation,
      loop: this.loopFocus,
      rtl: isRtl(this),
      isDisabled: (i) => isDisabled(items[i]),
    });
    if (next === undefined) return;
    event.preventDefault();
    this.#current = next;
    this.#sync();
    focusTarget(items[next]).focus();
  };

  #onFocusin = (event: FocusEvent) => {
    const index = this.#items().findIndex((el) => el.contains(event.target as Node));
    if (index < 0) return;
    this.#current = index;
    this.#sync();
  };

  // Exactly one enabled item is tabbable: the last focused one, or the first enabled one.
  #sync() {
    const items = this.#items();
    const enabled = items.flatMap((el, i) => (isDisabled(el) ? [] : [i]));
    const stop = enabled.includes(this.#current) ? this.#current : (enabled[0] ?? -1);
    items.forEach((el, i) => (focusTarget(el).tabIndex = i === stop ? 0 : -1));
  }
}

/**
 * Clusters related toolbar items. Its orientation follows the parent toolbar.
 * @summary Visually and semantically groups toolbar items.
 * @slot - Toolbar items.
 */
@customElement('taqwa-toolbar-group')
export class TaqwaToolbarGroup extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ reflect: true }) orientation: Orientation = 'horizontal';

  #internals = this.attachInternals();

  render() {
    return html`<slot></slot>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.#internals.role = 'group';
    this.orientation = this.closest('taqwa-toolbar')?.orientation ?? 'horizontal';
  }
}

/**
 * Visual and accessible divider between toolbar items. Perpendicular to the parent toolbar by default.
 * @summary Divider line between toolbar items.
 */
@customElement('taqwa-toolbar-separator')
export class TaqwaToolbarSeparator extends LitElement {
  static styles = unsafeCSS(styles);

  /** Defaults to perpendicular to the parent toolbar's orientation. */
  @property({ reflect: true }) orientation?: Orientation;

  #internals = this.attachInternals();

  connectedCallback() {
    super.connectedCallback();
    this.#internals.role = 'separator';
    this.orientation ??= this.closest('taqwa-toolbar')?.orientation === 'vertical' ? 'horizontal' : 'vertical';
  }

  updated() {
    this.#internals.ariaOrientation = this.orientation ?? null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-toolbar': TaqwaToolbar;
    'taqwa-toolbar-group': TaqwaToolbarGroup;
    'taqwa-toolbar-separator': TaqwaToolbarSeparator;
  }
}
