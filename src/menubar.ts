import { LitElement, html, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { isRtl, nextIndex } from './internal/a11y';
import type { TaqwaMenuBase } from './menu';
import styles from './menubar.css?inline';

/**
 * Horizontal bar of `taqwa-menu` elements. Arrow keys move between menus, and once one menu is open, hovering
 * another opens it instead.
 * @summary Application menu bar.
 * @slot - `taqwa-menu` elements, each with a `slot="trigger"` child.
 */
@customElement('taqwa-menubar')
export class TaqwaMenubar extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ reflect: true }) orientation: 'horizontal' | 'vertical' = 'horizontal';
  /** Arrow keys wrap from the last menu to the first. `loop-focus="false"` stops at the ends. */
  @property({ attribute: 'loop-focus', converter: { fromAttribute: (value: string | null) => value !== 'false' } })
  loopFocus = true;

  protected readonly internals = this.attachInternals();
  #ac?: AbortController;

  connectedCallback() {
    super.connectedCallback();
    this.internals.role = 'menubar';
    this.#ac = new AbortController();
    const { signal } = this.#ac;
    this.addEventListener('keydown', this.#onKeydown, { signal });
    this.addEventListener('pointerover', this.#onPointerOver, { signal });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#ac?.abort();
  }

  protected updated(changed: PropertyValues) {
    if (changed.has('orientation')) this.internals.ariaOrientation = this.orientation;
  }

  render() {
    return html`<slot></slot>`;
  }

  #menus() {
    return [...this.querySelectorAll<TaqwaMenuBase>(':scope > taqwa-menu')];
  }

  #onKeydown = (event: KeyboardEvent) => {
    const menus = this.#menus();
    const menu = menus.find((el) => event.composedPath().includes(el));
    if (!menu) return;
    const index = menus.indexOf(menu);
    const next = nextIndex(event.key, index, menus.length, {
      orientation: this.orientation,
      loop: this.loopFocus,
      rtl: isRtl(this),
    });
    if (next === undefined || next === index) return;

    event.preventDefault();
    const wasOpen = menu.open;
    menu.hide('list-navigation');
    const target = menus[next];
    target.querySelector<HTMLElement>(':scope > [slot="trigger"]')?.focus();
    if (wasOpen) target.show('first', 'list-navigation');
  };

  #onPointerOver = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    const menus = this.#menus();
    const menu = menus.find((el) => event.composedPath().includes(el));
    const current = menus.find((el) => el.open);
    if (!menu || !current || menu === current) return;
    current.hide('sibling-open');
    menu.show('popup', 'trigger-hover');
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-menubar': TaqwaMenubar;
  }
}
