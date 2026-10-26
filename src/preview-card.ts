import { unsafeCSS, type CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TaqwaPopupBase } from './popover';
import styles from './preview-card.css?inline';

/**
 * A link preview: hovering or focusing the trigger link shows the destination summary without blocking navigation
 * or focus. The card does not trap focus and is not announced as a dialog.
 *
 * @summary Preview of a link's destination shown on hover or focus.
 * @fires open-change - Fired when the preview opens or closes. `detail`: `{ open, reason }`. Cancelable.
 * @slot trigger - The link that opens the preview.
 * @slot - Preview content.
 * @csspart popup - The floating preview surface.
 * @csspart arrow - The optional pointer arrow.
 */
@customElement('taqwa-preview-card')
export class TaqwaPreviewCard extends TaqwaPopupBase {
  static styles: CSSResultGroup = [TaqwaPopupBase.styles, unsafeCSS(styles)];

  protected readonly popupClass = 'taqwa-preview-card';

  @property({ type: Number }) delay = 600;
  @property({ type: Number, attribute: 'close-delay' }) closeDelay = 300;

  protected focusOpens() {
    return true;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-preview-card': TaqwaPreviewCard;
  }
}
