import { LitElement, html, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { uid } from './internal/a11y';
import { TaqwaFormControl } from './internal/form-control';
import styles from './fieldset.css?inline';

/**
 * Groups related fields under a legend. `disabled` is pushed to every form control and `taqwa-button` inside.
 * @summary Labelled group of fields that can be disabled together.
 * @slot - Fields and controls.
 * @slot legend - Group heading, e.g. `<span slot="legend">Address</span>`.
 * @csspart base - The `role="group"` element.
 * @csspart legend - Wrapper of the legend slot.
 */
@customElement('taqwa-fieldset')
export class TaqwaFieldset extends LitElement {
  static styles = unsafeCSS(styles);

  /** Disables every form control and button inside. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  @state() private hasLegend = false;

  #legendId = uid('taqwa-legend');
  // Buttons this fieldset disabled, so re-enabling only undoes its own change.
  #forced = new WeakSet<object>();

  render() {
    return html`<div part="base" class="taqwa-fieldset" role="group" aria-labelledby=${ifDefined(this.hasLegend ? this.#legendId : undefined)}>
      <div part="legend" id=${this.#legendId} class="taqwa-fieldset__legend" ?hidden=${!this.hasLegend}>
        <slot name="legend" @slotchange=${this.#onLegendChange}></slot>
      </div>
      <slot @slotchange=${this.#sync}></slot>
    </div>`;
  }

  protected updated(changed: PropertyValues) {
    if (changed.has('disabled')) this.#sync();
  }

  #onLegendChange = (event: Event) => {
    this.hasLegend = (event.target as HTMLSlotElement).assignedNodes().length > 0;
  };

  #sync() {
    for (const el of Array.from(this.querySelectorAll('*'))) {
      if (el instanceof TaqwaFormControl) {
        el.formDisabledCallback(this.disabled);
      } else if (el.localName === 'taqwa-button') {
        const button = el as HTMLElement & { disabled: boolean };
        if (this.disabled && !button.disabled) {
          button.disabled = true;
          this.#forced.add(button);
        } else if (!this.disabled && this.#forced.delete(button)) {
          button.disabled = false;
        }
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-fieldset': TaqwaFieldset;
  }
}
