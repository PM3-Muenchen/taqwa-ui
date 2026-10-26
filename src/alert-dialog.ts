import { unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import { TaqwaDialog } from './dialog';
import styles from './alert-dialog.css?inline';

/**
 * A dialog that asks for a response before the page can continue. It has the `alertdialog` role and stays open on
 * outside presses; only an explicit `close` element, the Escape key or `show()`/`close()` change it.
 *
 * @summary Modal dialog that requires an explicit response.
 * @fires open-change - Fired before the dialog opens or closes. `detail`: `{ open, reason }`. Cancelable.
 * @slot trigger - Element that opens the dialog when clicked.
 * @slot title - Heading of the dialog. Labels the dialog.
 * @slot description - Supporting text. Describes the dialog.
 * @slot - Dialog content.
 * @slot close - Action elements that close the dialog when clicked, e.g. Cancel and Confirm.
 * @csspart dialog - The native `<dialog>` element.
 * @csspart backdrop - Frosted scrim behind the popup.
 * @csspart popup - The glass surface.
 * @csspart scroll - Scrollable body of the popup.
 * @csspart title - Heading wrapper.
 * @csspart description - Description wrapper.
 * @csspart content - Default slot wrapper.
 * @csspart actions - Footer wrapper of the `close` slot.
 */
@customElement('taqwa-alert-dialog')
export class TaqwaAlertDialog extends TaqwaDialog {
  static styles = unsafeCSS(styles);

  protected get dialogRole() {
    return 'alertdialog';
  }

  protected get dismissOnOutsidePress() {
    return false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-alert-dialog': TaqwaAlertDialog;
  }
}
