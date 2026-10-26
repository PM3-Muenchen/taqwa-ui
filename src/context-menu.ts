import { html, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import { TaqwaMenuBase, type MenuFocus } from './menu';
import menuStyles from './menu.css?inline';
import styles from './context-menu.css?inline';

const LONG_PRESS_MS = 500;

/**
 * Menu that opens at the pointer on right click, on the keyboard context-menu key, or on touch long press.
 * Items and submenus are the same as `taqwa-menu`'s.
 * @summary Menu anchored to the pointer.
 * @fires open-change - `{ open, reason }`. Cancel to keep the menu as it is.
 * @slot trigger - The region that opens the menu on right click or long press.
 * @slot - Items, groups, separators and submenus.
 * @csspart trigger - The region.
 * @csspart popup - The floating list.
 */
@customElement('taqwa-context-menu')
export class TaqwaContextMenu extends TaqwaMenuBase {
  static styles = [unsafeCSS(menuStyles), unsafeCSS(styles)];

  #point = { x: 0, y: 0 };
  #pressTimer?: ReturnType<typeof setTimeout>;

  protected anchor() {
    return {
      getBoundingClientRect: () => DOMRect.fromRect({ x: this.#point.x, y: this.#point.y, width: 0, height: 0 }),
    };
  }

  render() {
    return html`<span
      class="taqwa-menu-trigger"
      part="trigger"
      @contextmenu=${this.#onContextMenu}
      @pointerdown=${this.#onPointerDown}
      @pointerup=${this.#cancelPress}
      @pointermove=${this.#cancelPress}
      @pointercancel=${this.#cancelPress}
    ><slot name="trigger"></slot></span>${this.renderPopup()}`;
  }

  #onContextMenu = (event: MouseEvent) => {
    if (this.disabled) return;
    event.preventDefault();
    // Keyboard-initiated (Shift+F10, menu key) events carry no pointer position: open at the region's corner.
    if (!event.clientX && !event.clientY) {
      const { left, bottom } = this.renderRoot.querySelector('.taqwa-menu-trigger')!.getBoundingClientRect();
      this.#openAt(left, bottom, 'first');
    } else {
      this.#openAt(event.clientX, event.clientY);
    }
  };

  #onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') return;
    const { clientX: x, clientY: y } = event;
    this.#pressTimer = setTimeout(() => this.#openAt(x, y), LONG_PRESS_MS);
  };

  #cancelPress = () => {
    clearTimeout(this.#pressTimer);
  };

  #openAt(x: number, y: number, focus: MenuFocus = 'popup') {
    this.#point = { x, y };
    if (this.open) this.place();
    else this.show(focus, 'trigger-press');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-context-menu': TaqwaContextMenu;
  }
}
