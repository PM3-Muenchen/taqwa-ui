import { html, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { isRtl, type Orientation } from './internal/a11y';
import { TaqwaFormControl } from './internal/form-control';
import { bindGlassMotion } from './internal/motion';
import styles from './slider.css?inline';

/** One number, or one per thumb for a range slider. */
export type SliderValue = number | number[];

/**
 * A slider with one thumb, or several for a range. Drag or use the arrow, Page, Home and End keys on a thumb.
 *
 * @summary Picks a number, or a range of numbers, along a track.
 * @fires value-change - `{ value }`. Cancelable: `preventDefault()` keeps the current value.
 * @fires input - Dispatched after a change.
 * @fires change - Dispatched after a change.
 * @csspart base - The track area that receives pointer input.
 * @csspart control - The same element as `base`; kept for Base UI naming.
 * @csspart track - The rail.
 * @csspart indicator - The filled section between the thumbs.
 * @csspart thumb - The 44px hit area of each thumb, a `role="slider"`.
 */
@customElement('taqwa-slider')
export class TaqwaSlider extends TaqwaFormControl {
  static styles = unsafeCSS(styles);

  /** Unset, the slider sits at `min`. An array gives a range slider with one thumb per entry. */
  @property({ attribute: false }) value: SliderValue | undefined = undefined;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 100;
  @property({ type: Number }) step = 1;
  @property({ type: Number, attribute: 'large-step' }) largeStep = 10;
  @property({ reflect: true }) orientation: Orientation = 'horizontal';

  #defaultValue: SliderValue | undefined = undefined;
  #drag?: number;
  #glass = new Map<HTMLElement, VoidFunction>();

  get formValue(): SliderValue {
    return this.value ?? this.min;
  }

  protected get validationAnchor() {
    return this.renderRoot.querySelector<HTMLElement>('[part="thumb"]');
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this.#bindGlass();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#glass.forEach((unbind) => unbind());
    this.#glass.clear();
  }

  firstUpdated() {
    this.#defaultValue = this.value;
  }

  updated() {
    this.#bindGlass();
    this.#commit();
  }

  formResetCallback() {
    this.value = this.#defaultValue;
  }

  render() {
    const values = this.#values;
    const positions = values.map((value) => this.#percent(value));
    const start = values.length > 1 ? Math.min(...positions) : 0;
    const end = values.length > 1 ? Math.max(...positions) : positions[0];
    const disabled = this.isDisabled;
    return html`<div
      part="control"
      class="taqwa-slider__control"
      @pointerdown=${this.#onPointerDown}
      @pointermove=${this.#onPointerMove}
      @pointerup=${this.#onPointerUp}
      @pointercancel=${this.#onPointerUp}
    >
      <div part="track" class="taqwa-slider__track">
        <div
          part="indicator"
          class="taqwa-slider__indicator"
          style="--_start:${start}%;--_size:${end - start}%"
        ></div>
      </div>
      ${values.map((value, index) => {
        const [low, high] = this.#bounds(index);
        return html`<span
          part="thumb"
          class="taqwa-slider__thumb"
          role="slider"
          tabindex=${disabled ? -1 : 0}
          style="--_pos:${positions[index]}%"
          aria-orientation=${this.orientation}
          aria-label=${ifDefined(this.controlLabel)}
          aria-description=${ifDefined(this.controlDescription)}
          aria-invalid=${ifDefined(this.controlInvalid)}
          aria-disabled=${ifDefined(disabled ? 'true' : undefined)}
          aria-valuemin=${low}
          aria-valuemax=${high}
          aria-valuenow=${value}
          @keydown=${(event: KeyboardEvent) => this.#onKeyDown(event, index)}
        ><span class="taqwa-slider__pill"></span></span>`;
      })}
    </div>`;
  }

  get #values(): number[] {
    if (this.value === undefined) return [this.min];
    return Array.isArray(this.value) ? this.value : [this.value];
  }

  #bindGlass() {
    this.renderRoot.querySelectorAll<HTMLElement>('.taqwa-slider__pill').forEach((pill) => {
      if (!this.#glass.has(pill)) this.#glass.set(pill, bindGlassMotion(pill, { disabled: () => this.isDisabled }));
    });
  }

  /** Position along the track in CSS percent; mirrored for horizontal RTL so the start edge is the right edge. */
  #percent(value: number) {
    const percent = ((value - this.min) / (this.max - this.min)) * 100;
    return isRtl(this) && this.orientation === 'horizontal' ? 100 - percent : percent;
  }

  #bounds(index: number): [number, number] {
    const values = this.#values;
    return [index > 0 ? values[index - 1] : this.min, index < values.length - 1 ? values[index + 1] : this.max];
  }

  #snap(raw: number) {
    const snapped = this.min + Math.round((raw - this.min) / this.step) * this.step;
    return Math.min(this.max, Math.max(this.min, Number(snapped.toFixed(10))));
  }

  #valueAt(event: PointerEvent) {
    const rect = this.renderRoot.querySelector('.taqwa-slider__control')!.getBoundingClientRect();
    const ratio =
      this.orientation === 'vertical'
        ? (rect.bottom - event.clientY) / rect.height
        : isRtl(this)
          ? (rect.right - event.clientX) / rect.width
          : (event.clientX - rect.left) / rect.width;
    return this.min + Math.min(1, Math.max(0, ratio)) * (this.max - this.min);
  }

  #moveThumb(index: number, raw: number) {
    const [low, high] = this.#bounds(index);
    const next = [...this.#values];
    next[index] = Math.min(high, Math.max(low, this.#snap(raw)));
    this.#update(next);
  }

  #update(next: number[]) {
    const current = this.#values;
    if (next.every((value, index) => value === current[index])) return;
    const value = Array.isArray(this.value) ? next : next[0];
    if (!this.emit('value-change', { value })) return;
    this.value = value;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  #onPointerDown = (event: PointerEvent) => {
    if (this.isDisabled) return;
    const raw = this.#valueAt(event);
    const values = this.#values;
    this.#drag = values.reduce((best, value, index) => (Math.abs(value - raw) < Math.abs(values[best] - raw) ? index : best), 0);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.#moveThumb(this.#drag, raw);
  };

  #onPointerMove = (event: PointerEvent) => {
    if (this.#drag !== undefined) this.#moveThumb(this.#drag, this.#valueAt(event));
  };

  #onPointerUp = () => {
    this.#drag = undefined;
  };

  #onKeyDown(event: KeyboardEvent, index: number) {
    if (this.isDisabled) return;
    const value = this.#values[index];
    const step = event.shiftKey ? this.largeStep : this.step;
    const forward = isRtl(this) ? -1 : 1;
    let next: number;
    switch (event.key) {
      case 'Home':
        next = this.min;
        break;
      case 'End':
        next = this.max;
        break;
      case 'PageUp':
        next = value + this.largeStep;
        break;
      case 'PageDown':
        next = value - this.largeStep;
        break;
      case 'ArrowUp':
        next = value + step;
        break;
      case 'ArrowDown':
        next = value - step;
        break;
      case 'ArrowRight':
        next = value + forward * step;
        break;
      case 'ArrowLeft':
        next = value - forward * step;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.#moveThumb(index, next);
  }

  #commit() {
    this.commitValue(this.name && !this.isDisabled ? this.#submission() : null);
  }

  #submission(): string | FormData {
    if (!Array.isArray(this.value)) return String(this.#values[0]);
    const data = new FormData();
    this.#values.forEach((value) => data.append(this.name, String(value)));
    return data;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-slider': TaqwaSlider;
  }
}
