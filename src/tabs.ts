import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { animate, type AnimationOptions } from 'motion';
import { isRtl, nextIndex, uid } from './internal/a11y';
import { bindGlassMotion, prefersReducedMotion } from './internal/motion';
import styles from './tabs.css?inline';

export type TabsOrientation = 'horizontal' | 'vertical';

const emit = (target: EventTarget, type: string, detail: unknown) =>
  target.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true, cancelable: true }));

/** Descendants of `scope` that belong to it, not to a nested tabs component. */
const owned = <T extends Element>(scope: Element, selector: string) =>
  [...scope.querySelectorAll<T>(selector)].filter((el) => el.closest(scope.localName) === scope);

/**
 * Toggles between related panels. Tabs and panels are paired by `value`.
 *
 * @summary Root of a tabs set; holds the active `value`.
 * @fires value-change - Fired when the active tab changes, `detail: { value: string }`. Cancel to keep the current tab.
 * @slot - `taqwa-tabs-list` and `taqwa-tabs-panel` elements.
 * @csspart base - Layout wrapper.
 */
@customElement('taqwa-tabs')
export class TaqwaTabs extends LitElement {
  static styles = unsafeCSS(styles);

  /** Value of the active tab. Defaults to the first enabled tab. */
  @property({ reflect: true }) value?: string;
  @property({ reflect: true }) orientation: TabsOrientation = 'horizontal';

  render() {
    return html`<div part="base" class="taqwa-tabs taqwa-tabs--${this.orientation}"><slot></slot></div>`;
  }

  updated() {
    const tabs = owned<TaqwaTab>(this, 'taqwa-tab');
    const panels = owned<TaqwaTabsPanel>(this, 'taqwa-tabs-panel');
    if (this.value === undefined) this.value = tabs.find((tab) => !tab.disabled)?.value;

    for (const panel of panels) panel.id ||= uid('taqwa-tabs-panel');
    for (const tab of tabs) {
      tab.id ||= uid('taqwa-tab');
      const panel = panels.find((p) => p.value === tab.value);
      if (panel) {
        tab.setAttribute('aria-controls', panel.id);
        panel.setAttribute('aria-labelledby', tab.id);
      }
    }
    for (const el of [...tabs, ...panels, ...owned<TaqwaTabsList>(this, 'taqwa-tabs-list')]) el.requestUpdate();
  }

  /** @internal Called by `taqwa-tab` on press and by `taqwa-tabs-list` on keyboard activation. */
  activate(tab: TaqwaTab) {
    if (tab.disabled || tab.value === this.value) return;
    if (!emit(this, 'value-change', { value: tab.value })) return;
    this.value = tab.value;
  }
}

/**
 * Holds the tabs and the glass indicator that slides to the active one. Arrow keys move focus between tabs.
 *
 * @summary Row or column of tabs with a moving indicator.
 * @slot - `taqwa-tab` elements.
 * @csspart base - Track around the tabs.
 * @csspart indicator - Glass pill that follows the active tab.
 */
@customElement('taqwa-tabs-list')
export class TaqwaTabsList extends LitElement {
  static styles = unsafeCSS(styles);

  /** Activates a tab as soon as arrow keys move focus to it, instead of waiting for Enter or Space. */
  @property({ type: Boolean, attribute: 'activate-on-focus' }) activateOnFocus = false;
  /** Wraps focus from the last tab back to the first. Set as a property. */
  @property({ attribute: false }) loopFocus = true;

  #internals = this.attachInternals();
  #resize?: ResizeObserver;
  #placed = false;

  render() {
    const orientation = this.closest<TaqwaTabs>('taqwa-tabs')?.orientation ?? 'horizontal';
    return html`<div part="base" class="taqwa-tabs-list taqwa-tabs-list--${orientation}" @keydown=${this.#onKeydown}>
      <span part="indicator" class="taqwa-tabs-indicator" aria-hidden="true"></span>
      <slot></slot>
    </div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.#internals.role = 'tablist';
    this.#resize ??= new ResizeObserver(() => this.requestUpdate());
    this.#resize.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#resize?.disconnect();
  }

  updated() {
    const root = this.closest<TaqwaTabs>('taqwa-tabs');
    this.#internals.ariaOrientation = root?.orientation ?? 'horizontal';
    const track = this.renderRoot.querySelector<HTMLElement>('.taqwa-tabs-list')!;
    const indicator = this.renderRoot.querySelector<HTMLElement>('.taqwa-tabs-indicator')!;
    const tab = owned<TaqwaTab>(this, 'taqwa-tab').find((t) => t.value === root?.value);
    indicator.hidden = !tab;
    if (!tab) return;
    const origin = track.getBoundingClientRect();
    const { left, top, width, height } = tab.getBoundingClientRect();
    const transition: AnimationOptions =
      this.#placed && !prefersReducedMotion() ? { type: 'spring', visualDuration: 0.3, bounce: 0.15 } : { duration: 0 };
    animate(indicator, { x: left - origin.left, y: top - origin.top, width, height }, transition);
    this.#placed = true;
  }

  #onKeydown(event: KeyboardEvent) {
    const root = this.closest<TaqwaTabs>('taqwa-tabs');
    const tabs = owned<TaqwaTab>(this, 'taqwa-tab');
    const current = tabs.indexOf(event.target as TaqwaTab);
    if (!root || current < 0) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      root.activate(tabs[current]);
      return;
    }
    const index = nextIndex(event.key, current, tabs.length, {
      orientation: root.orientation,
      loop: this.loopFocus,
      rtl: isRtl(this),
      isDisabled: (i) => tabs[i].disabled,
    });
    if (index === undefined) return;
    event.preventDefault();
    tabs[index].focus();
    if (this.activateOnFocus) root.activate(tabs[index]);
  }
}

/**
 * A tab button. Its panel is the `taqwa-tabs-panel` with the same `value`.
 *
 * @summary One tab in a `taqwa-tabs-list`.
 * @slot - Tab label.
 * @csspart base - Glass control inside the tab.
 */
@customElement('taqwa-tab')
export class TaqwaTab extends LitElement {
  static styles = unsafeCSS(styles);

  /** Identifies the tab and the panel that shares its value. */
  @property() value = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  #internals = this.attachInternals();
  #unbindMotion?: VoidFunction;

  get active() {
    return this.closest<TaqwaTabs>('taqwa-tabs')?.value === this.value;
  }

  render() {
    return html`<span part="base" class="taqwa-tab" @click=${this.#onClick}><slot></slot></span>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.#internals.role = 'tab';
    if (this.hasUpdated) this.#bindMotion();
    this.closest<TaqwaTabs>('taqwa-tabs')?.requestUpdate();
  }

  firstUpdated() {
    this.#bindMotion();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#unbindMotion?.();
  }

  updated() {
    const active = this.active;
    this.toggleAttribute('data-active', active);
    this.#internals.ariaSelected = String(active);
    this.#internals.ariaDisabled = String(this.disabled);
    this.tabIndex = active && !this.disabled ? 0 : -1;
  }

  #onClick() {
    this.closest<TaqwaTabs>('taqwa-tabs')?.activate(this);
  }

  #bindMotion() {
    this.#unbindMotion = bindGlassMotion(this.renderRoot.querySelector('.taqwa-tab')!, {
      disabled: () => this.disabled,
    });
  }
}

/**
 * Content shown while the tab with the same `value` is active. Inactive panels are hidden.
 *
 * @summary Panel for one tab.
 * @slot - Panel content.
 * @csspart base - Padded wrapper around the content.
 */
@customElement('taqwa-tabs-panel')
export class TaqwaTabsPanel extends LitElement {
  static styles = unsafeCSS(styles);

  /** Value of the tab this panel belongs to. */
  @property() value = '';

  #internals = this.attachInternals();
  #entering = false;

  render() {
    return html`<div part="base" class="taqwa-tabs-panel"><slot></slot></div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.#internals.role = 'tabpanel';
    this.tabIndex = 0;
    this.closest<TaqwaTabs>('taqwa-tabs')?.requestUpdate();
  }

  willUpdate() {
    const hidden = this.closest<TaqwaTabs>('taqwa-tabs')?.value !== this.value;
    this.#entering = this.hasUpdated && !hidden && this.hidden;
    this.hidden = hidden;
  }

  updated() {
    if (this.#entering) animate(this, { opacity: [0, 1] }, prefersReducedMotion() ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-tabs': TaqwaTabs;
    'taqwa-tabs-list': TaqwaTabsList;
    'taqwa-tab': TaqwaTab;
    'taqwa-tabs-panel': TaqwaTabsPanel;
  }
}
