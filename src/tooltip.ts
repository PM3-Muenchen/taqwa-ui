import { unsafeCSS, type CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TaqwaPopupBase } from './popover';
import styles from './tooltip.css?inline';

// Shared by every tooltip: a tooltip that closes lets its neighbour open without the delay (provider grouping).
let lastClosedAt = 0;
const groupWindow = 400;

/**
 * A non-interactive hint shown on hover or focus of its trigger. Dismissed by Escape, blur, pointer leave or press.
 *
 * @summary Hint shown on hover or focus of the trigger.
 * @fires open-change - Fired when the tooltip opens or closes. `detail`: `{ open, reason }`. Cancelable.
 * @slot trigger - The element that the tooltip describes.
 * @slot - Tooltip content.
 * @csspart popup - The floating tooltip surface.
 * @csspart arrow - The optional pointer arrow.
 */
@customElement('taqwa-tooltip')
export class TaqwaTooltip extends TaqwaPopupBase {
  static styles: CSSResultGroup = [TaqwaPopupBase.styles, unsafeCSS(styles)];

  protected readonly popupClass = 'taqwa-tooltip';
  protected popupRole = 'tooltip';

  @property({ type: Number }) delay = 600;
  @property({ type: Number, attribute: 'close-delay' }) closeDelay = 0;

  protected focusOpens() {
    return true;
  }

  protected openDelay() {
    return Date.now() - lastClosedAt < groupWindow ? 0 : this.delay;
  }

  protected onPress() {
    this.request(false, 'trigger-press');
  }

  protected closed() {
    lastClosedAt = Date.now();
  }

  protected syncAria() {
    // The popup lives in this shadow root, which the light-DOM trigger cannot reference, so describe it by text.
    const text = [...this.childNodes]
      .filter((node) => !(node instanceof Element && node.slot === 'trigger'))
      .map((node) => node.textContent)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) this.triggerEl?.setAttribute('aria-description', text);
    else this.triggerEl?.removeAttribute('aria-description');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-tooltip': TaqwaTooltip;
  }
}
