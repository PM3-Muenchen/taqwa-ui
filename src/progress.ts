import { LitElement, html, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { animate } from 'motion';
import { uid } from './internal/a11y';
import { prefersReducedMotion } from './internal/motion';
import styles from './progress.css?inline';

export type ProgressStatus = 'indeterminate' | 'progressing' | 'complete';

const spring = { type: 'spring', visualDuration: 0.5, bounce: 0 } as const;
const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Shows the status of a task that takes a long time. A `null` value is indeterminate and shimmers.
 *
 * @summary Task progress bar. Set `value` to `null` for an indeterminate shimmer.
 * @fires none
 * @slot label - Accessible label, e.g. "Export data".
 * @csspart base - Outer wrapper, the `progressbar` role.
 * @csspart header - Row holding the label and the value.
 * @csspart label - Label wrapper.
 * @csspart value - Formatted value text.
 * @csspart track - Background track.
 * @csspart indicator - Filled portion, animated with motion.
 */
@customElement('taqwa-progress')
export class TaqwaProgress extends LitElement {
  static styles = unsafeCSS(styles);

  /** Current value. `null` renders the indeterminate state. */
  @property({ type: Number, reflect: true }) value: number | null = null;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 100;
  /** Options for `Intl.NumberFormat` used to format the visible and announced value. */
  @property({ attribute: false }) format?: Intl.NumberFormatOptions;
  @property() locale?: string;

  @query('.taqwa-progress-indicator') private indicator!: HTMLElement;

  #labelId = uid('taqwa-progress-label');
  #shimmer?: ReturnType<typeof animate>;

  render() {
    const text = this.#text();
    return html`<div
      part="base"
      class="taqwa-progress"
      role="progressbar"
      aria-labelledby=${this.#labelId}
      aria-valuemin=${this.min}
      aria-valuemax=${this.max}
      aria-valuenow=${ifDefined(this.value ?? undefined)}
      aria-valuetext=${ifDefined(text || undefined)}
      data-status=${this.#status()}
    >
      <div part="header" class="taqwa-progress-header">
        <span part="label" class="taqwa-progress-label" id=${this.#labelId}><slot name="label"></slot></span>
        <span part="value" class="taqwa-progress-value">${text}</span>
      </div>
      <div part="track" class="taqwa-progress-track">
        <div part="indicator" class="taqwa-progress-indicator"></div>
      </div>
    </div>`;
  }

  updated(changed: PropertyValues<this>) {
    if (!changed.has('value') && !changed.has('min') && !changed.has('max')) return;
    const el = this.indicator;
    const instant = prefersReducedMotion();
    this.#shimmer?.stop();
    this.#shimmer = undefined;
    if (this.value === null) {
      animate(el, { width: '40%' }, { duration: 0 });
      if (!instant) this.#shimmer = animate(el, { x: ['-100%', '250%'] }, { duration: 1.4, ease: 'linear', repeat: Infinity });
    } else {
      animate(el, { width: `${this.#ratio() * 100}%`, x: 0 }, instant ? { duration: 0 } : spring);
    }
  }

  #status(): ProgressStatus {
    if (this.value === null) return 'indeterminate';
    return this.value >= this.max ? 'complete' : 'progressing';
  }

  #ratio() {
    return this.value === null ? 0 : clamp((this.value - this.min) / (this.max - this.min));
  }

  #text() {
    return this.value === null ? '' : new Intl.NumberFormat(this.locale, this.format).format(this.value);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-progress': TaqwaProgress;
  }
}
