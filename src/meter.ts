import { LitElement, html, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { animate } from 'motion';
import { uid } from './internal/a11y';
import { prefersReducedMotion } from './internal/motion';
import styles from './meter.css?inline';

const spring = { type: 'spring', visualDuration: 0.5, bounce: 0 } as const;
const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * A graphical display of a numeric value within a range, such as storage used or a rating.
 *
 * @summary Numeric value within a range. Unlike progress, it describes a measurement, not a task.
 * @slot label - Accessible label, e.g. "Storage used".
 * @csspart base - Outer wrapper, the `meter` role.
 * @csspart header - Row holding the label and the value.
 * @csspart label - Label wrapper.
 * @csspart value - Formatted value text.
 * @csspart track - Background track.
 * @csspart indicator - Filled portion, animated with motion.
 */
@customElement('taqwa-meter')
export class TaqwaMeter extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ type: Number, reflect: true }) value = 0;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 100;
  /** Options for `Intl.NumberFormat` used to format the visible and announced value. */
  @property({ attribute: false }) format?: Intl.NumberFormatOptions;
  @property() locale?: string;

  @query('.taqwa-meter-indicator') private indicator!: HTMLElement;

  #labelId = uid('taqwa-meter-label');

  render() {
    const text = new Intl.NumberFormat(this.locale, this.format).format(this.value);
    return html`<div
      part="base"
      class="taqwa-meter"
      role="meter"
      aria-labelledby=${this.#labelId}
      aria-valuemin=${this.min}
      aria-valuemax=${this.max}
      aria-valuenow=${this.value}
      aria-valuetext=${text}
    >
      <div part="header" class="taqwa-meter-header">
        <span part="label" class="taqwa-meter-label" id=${this.#labelId}><slot name="label"></slot></span>
        <span part="value" class="taqwa-meter-value">${text}</span>
      </div>
      <div part="track" class="taqwa-meter-track">
        <div part="indicator" class="taqwa-meter-indicator"></div>
      </div>
    </div>`;
  }

  updated(changed: PropertyValues<this>) {
    if (!changed.has('value') && !changed.has('min') && !changed.has('max')) return;
    const ratio = clamp((this.value - this.min) / (this.max - this.min));
    animate(this.indicator, { width: `${ratio * 100}%` }, prefersReducedMotion() ? { duration: 0 } : spring);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-meter': TaqwaMeter;
  }
}
