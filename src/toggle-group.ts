import { LitElement, html, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { isRtl, nextIndex, type Orientation } from './internal/a11y';
import { TaqwaToggle, type TogglePressedChangeDetail } from './toggle';
import styles from './toggle-group.css?inline';

export type ToggleGroupValueChangeDetail = { value: string[] };

const isDisabled = (el?: Element) => el?.closest('[disabled]') != null;
const focusTarget = (el: HTMLElement) => el.shadowRoot?.querySelector<HTMLElement>('[part~="base"]') ?? el;

/**
 * Shares pressed state across a set of toggles: one pressed at a time, or several with `multiple`.
 * Inside a `taqwa-toolbar` the toolbar owns keyboard navigation.
 * @summary Groups toggles and manages their shared value.
 * @fires value-change - Fired when the pressed toggles change. `detail: { value }`. Call `preventDefault()` to keep the current value.
 * @slot - `taqwa-toggle` items.
 * @csspart base - The wrapper around the slot.
 */
@customElement('taqwa-toggle-group')
export class TaqwaToggleGroup extends LitElement {
  static styles = unsafeCSS(styles);

  /** Values of the pressed toggles. */
  @property({ attribute: false }) value: string[] = [];
  @property({ type: Boolean, reflect: true }) multiple = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ reflect: true }) orientation: Orientation = 'horizontal';
  @property({ attribute: 'loop-focus', converter: { fromAttribute: (value: string | null) => value !== 'false' } })
  loopFocus = true;

  #internals = this.attachInternals();
  #current = 0;

  render() {
    return html`<div part="base" class="taqwa-toggle-group"><slot @slotchange=${this.#sync}></slot></div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.#internals.role = 'group';
    this.addEventListener('pressed-change', this.#onPressedChange);
    this.addEventListener('keydown', this.#onKeydown);
    this.addEventListener('focusin', this.#onFocusin);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('pressed-change', this.#onPressedChange);
    this.removeEventListener('keydown', this.#onKeydown);
    this.removeEventListener('focusin', this.#onFocusin);
  }

  updated(changed: PropertyValues) {
    if (changed.has('value')) this.#sync();
    if (changed.has('disabled')) this.#toggles().forEach((toggle) => toggle.requestUpdate());
  }

  #toggles() {
    return [...this.querySelectorAll<TaqwaToggle>('taqwa-toggle')];
  }

  // Runs after the toggle has dispatched `pressed-change`; the group decides the next value and resyncs every toggle.
  #onPressedChange = (event: Event) => {
    const toggle = event.target as TaqwaToggle;
    if (!(toggle instanceof TaqwaToggle) || toggle.closest('taqwa-toggle-group') !== this) return;
    event.preventDefault();
    const { pressed } = (event as CustomEvent<TogglePressedChangeDetail>).detail;
    const others = this.multiple ? this.value.filter((value) => value !== toggle.value) : [];
    const next = pressed ? [...others, toggle.value] : others;
    const change = new CustomEvent<ToggleGroupValueChangeDetail>('value-change', {
      detail: { value: next },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(change);
    if (!change.defaultPrevented) this.value = next;
    this.#sync();
  };

  #onKeydown = (event: KeyboardEvent) => {
    const toggles = this.#toggles();
    const index = toggles.findIndex((toggle) => toggle.contains(event.target as Node));
    if (index < 0 || this.closest('taqwa-toolbar')) return;
    const next = nextIndex(event.key, index, toggles.length, {
      orientation: this.orientation,
      loop: this.loopFocus,
      rtl: isRtl(this),
      isDisabled: (i) => isDisabled(toggles[i]),
    });
    if (next === undefined) return;
    event.preventDefault();
    this.#current = next;
    this.#sync();
    focusTarget(toggles[next]).focus();
  };

  #onFocusin = (event: FocusEvent) => {
    const index = this.#toggles().findIndex((toggle) => toggle.contains(event.target as Node));
    if (index < 0) return;
    this.#current = index;
    this.#sync();
  };

  // Keeps `pressed` in line with `value`, then makes one enabled toggle tabbable (roving tabindex).
  #sync() {
    const toggles = this.#toggles();
    toggles.forEach((toggle) => (toggle.pressed = this.value.includes(toggle.value)));
    if (this.closest('taqwa-toolbar')) return;
    const enabled = toggles.flatMap((toggle, i) => (isDisabled(toggle) ? [] : [i]));
    const stop = enabled.includes(this.#current)
      ? this.#current
      : (enabled.find((i) => toggles[i].pressed) ?? enabled[0] ?? -1);
    toggles.forEach((toggle, i) => (focusTarget(toggle).tabIndex = i === stop ? 0 : -1));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-toggle-group': TaqwaToggleGroup;
  }
}
