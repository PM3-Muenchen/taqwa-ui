import { html, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { animate, type AnimationOptions } from 'motion';
import { isRtl } from './internal/a11y';
import { TaqwaFormControl } from './internal/form-control';
import { prefersReducedMotion } from './internal/motion';
import styles from './switch.css?inline';

/** Thumb travel in px between the off and on positions (track 44px, thumb 20px, 2px padding). */
const TRAVEL = 20;

const spring = (): AnimationOptions =>
  prefersReducedMotion() ? { duration: 0 } : { type: 'spring', visualDuration: 0.3, bounce: 0.25 };

/**
 * An on/off switch. The whole element, including its default-slot label, toggles it.
 *
 * @summary Turns a setting on or off and submits `value` when on.
 * @fires checked-change - `{ checked }`. Cancelable: `preventDefault()` keeps the current state.
 * @fires input - Dispatched after a change.
 * @fires change - Dispatched after a change.
 * @slot - Label text.
 * @csspart base - The track, a `<button role="switch">`.
 * @csspart thumb - The sliding thumb.
 * @csspart label - Wraps the default slot.
 */
@customElement('taqwa-switch')
export class TaqwaSwitch extends TaqwaFormControl {
  static styles = unsafeCSS(styles);

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ reflect: true }) value = 'on';
  @property({ type: Boolean, reflect: true, attribute: 'read-only' }) readOnly = false;

  #defaultChecked = false;
  #mounted = false;
  #onClick = () => this.#toggle();

  get formValue() {
    return this.checked;
  }

  protected get validationAnchor() {
    return this.renderRoot.querySelector<HTMLElement>('[part="base"]');
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.#onClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.#onClick);
  }

  firstUpdated() {
    this.#defaultChecked = this.checked;
  }

  updated(changed: PropertyValues<this>) {
    const thumb = this.renderRoot.querySelector<HTMLElement>('[part="thumb"]');
    if (thumb && changed.has('checked')) {
      const x = this.checked ? (isRtl(this) ? -TRAVEL : TRAVEL) : 0;
      animate(thumb, { x }, this.#mounted ? spring() : { duration: 0 });
    }
    this.#mounted = true;
    this.#commit();
  }

  formResetCallback() {
    this.checked = this.#defaultChecked;
  }

  render() {
    return html`<button
        part="base"
        type="button"
        class="taqwa-switch"
        role="switch"
        aria-checked=${String(this.checked)}
        aria-label=${ifDefined(this.controlLabel || this.textContent?.trim() || undefined)}
        aria-description=${ifDefined(this.controlDescription)}
        aria-invalid=${ifDefined(this.controlInvalid)}
        aria-readonly=${ifDefined(this.readOnly ? 'true' : undefined)}
        aria-required=${ifDefined(this.required ? 'true' : undefined)}
        ?disabled=${this.isDisabled}
        @pointerdown=${() => this.#squish(true)}
        @pointerup=${() => this.#squish(false)}
        @pointerleave=${() => this.#squish(false)}
        @pointercancel=${() => this.#squish(false)}
      ><span part="thumb" class="taqwa-switch__thumb"></span></button>
      <span part="label" class="taqwa-switch__label"><slot></slot></span>`;
  }

  /** Jelly stretch of the thumb while the pointer is down. */
  #squish(pressed: boolean) {
    const thumb = this.renderRoot.querySelector<HTMLElement>('[part="thumb"]');
    if (!thumb || this.isDisabled || this.readOnly) return;
    animate(thumb, pressed ? { scaleX: 1.3, scaleY: 0.9 } : { scaleX: 1, scaleY: 1 }, spring());
  }

  #commit() {
    const disabled = this.isDisabled;
    this.commitValue(
      this.checked && !disabled ? this.value : null,
      { valueMissing: this.required && !this.checked && !disabled },
      'Please turn this on.',
    );
  }

  #toggle() {
    if (this.isDisabled || this.readOnly) return;
    const previous = this.checked;
    this.checked = !previous;
    if (!this.emit('checked-change', { checked: this.checked })) {
      this.checked = previous;
      return;
    }
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-switch': TaqwaSwitch;
  }
}
