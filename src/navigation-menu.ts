import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { animate, type AnimationOptions } from 'motion';
import { animateHeight, bindGlassMotion, prefersReducedMotion } from './internal/motion';
import { isRtl, nextIndex } from './internal/a11y';
import { onDismiss } from './internal/popup';
import styles from './navigation-menu.css?inline';

export type NavigationReason = 'trigger-press' | 'trigger-hover' | 'list-navigation' | 'item-press' | 'escape-key' | 'outside-press' | 'none';

const emit = (target: HTMLElement, name: string, detail: object) =>
  target.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true }));

/** Desktop shows panels in one shared frame under the list; mobile stacks them as disclosures. */
const desktop = () => typeof matchMedia === 'function' && matchMedia('(min-width: 48rem)').matches;
const transition = (options: AnimationOptions): AnimationOptions => (prefersReducedMotion() ? { duration: 0 } : options);
const spring: AnimationOptions = { type: 'spring', visualDuration: 0.3, bounce: 0.15 };
const quick: AnimationOptions = { duration: 0.15, ease: 'easeIn' };

/**
 * Link in a navigation menu. Renders an `<a>`.
 * @summary Navigation link.
 * @csspart base - The `<a>` element.
 */
@customElement('taqwa-navigation-menu-link')
export class TaqwaNavigationMenuLink extends LitElement {
  static styles = unsafeCSS(styles);
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  @property() href = '';
  /** Marks the current page with `aria-current="page"`. */
  @property({ type: Boolean, reflect: true }) active = false;

  #unbindMotion?: VoidFunction;

  render() {
    return html`<a
      part="base"
      class="taqwa-navigation-menu-link"
      href=${ifDefined(this.href || undefined)}
      aria-current=${ifDefined(this.active ? 'page' : undefined)}
    ><slot></slot></a>`;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this.#bindMotion();
  }

  firstUpdated() {
    this.#bindMotion();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#unbindMotion?.();
  }

  #bindMotion() {
    this.#unbindMotion = bindGlassMotion(this.renderRoot.querySelector('a')!);
  }
}

/**
 * Entry of a navigation menu. With a `slot="trigger"` child it opens the rest of its content as a panel; without one it is a
 * plain entry such as a link.
 * @summary Navigation item with an optional panel.
 * @fires open-change - `{ open, reason }`. Cancel to keep the panel closed.
 * @slot trigger - The button that opens the panel.
 * @slot - Panel content, or the link of a plain entry.
 * @csspart panel - Wrapper around the panel content.
 */
@customElement('taqwa-navigation-menu-item')
export class TaqwaNavigationMenuItem extends LitElement {
  static styles = unsafeCSS(styles);

  /** The panel is showing. Reflected for styling. */
  @property({ type: Boolean, reflect: true }) open = false;

  protected readonly internals = this.attachInternals();
  #ac?: AbortController;
  #timer?: ReturnType<typeof setTimeout>;

  get trigger(): HTMLElement | null {
    return this.querySelector(':scope > [slot="trigger"]');
  }

  get panel(): HTMLElement {
    return this.renderRoot.querySelector<HTMLElement>('.taqwa-navigation-menu-panel')!;
  }

  /** The element that receives keyboard focus in the navigation: the trigger, or the link of a plain entry. */
  get focusTarget(): HTMLElement | null {
    return this.trigger ?? this.querySelector(':scope > taqwa-navigation-menu-link');
  }

  connectedCallback() {
    super.connectedCallback();
    this.internals.role = 'listitem';
    this.#ac = new AbortController();
    const { signal } = this.#ac;
    this.addEventListener('click', this.#onClick, { signal });
    this.addEventListener('pointerenter', this.#onEnter, { signal });
    this.addEventListener('pointerleave', this.#onLeave, { signal });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#ac?.abort();
    clearTimeout(this.#timer);
  }

  firstUpdated() {
    if (!this.trigger) return;
    this.toggleAttribute('panel', true);
    this.panel.hidden = true;
  }

  /** Moves focus to the first link in the panel. */
  focusPanel() {
    [...this.querySelectorAll<HTMLElement>('a[href], taqwa-navigation-menu-link')]
      .find((el) => !el.closest('[slot="trigger"]'))
      ?.focus();
  }

  /** Shows or hides the panel. The navigation menu calls this so one panel is open at a time. */
  showPanel(open: boolean, direction: number) {
    const panel = this.panel;
    this.open = open;
    this.trigger?.setAttribute('aria-expanded', String(open));
    if (desktop()) {
      if (open) {
        panel.hidden = false;
        animate(panel, { opacity: [0, 1], x: [direction * 16, 0] }, transition(spring));
      } else {
        animate(panel, { opacity: 0, x: -direction * 16 }, transition(quick)).then(() => {
          if (!this.open) panel.hidden = true;
        });
      }
    } else if (open) {
      panel.hidden = false;
      panel.style.height = '0px';
      animateHeight(panel, true);
    } else {
      animateHeight(panel, false).then(() => {
        if (!this.open) panel.hidden = true;
      });
    }
  }

  get #root() {
    return this.closest('taqwa-navigation-menu') as TaqwaNavigationMenu | null;
  }

  #onClick = (event: MouseEvent) => {
    const path = event.composedPath();
    if (path.some((el) => el instanceof TaqwaNavigationMenuLink)) {
      this.#root?.activate(null, 'item-press');
    } else if (this.trigger && path.includes(this.trigger)) {
      // On desktop, a trigger already opened by hovering stays open when clicked.
      if (!this.open) this.#root?.activate(this, 'trigger-press');
      else if (!desktop()) this.#root?.activate(null, 'trigger-press');
    }
  };

  #onEnter = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || !desktop()) return;
    clearTimeout(this.#timer);
    this.#root?.activate(this.trigger ? this : null, 'trigger-hover');
  };

  #onLeave = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || !desktop()) return;
    this.#timer = setTimeout(() => {
      if (this.open) this.#root?.activate(null, 'trigger-hover');
    }, 200);
  };

  render() {
    return html`<slot name="trigger"></slot><div class="taqwa-navigation-menu-panel" part="panel"><slot></slot></div>`;
  }
}

/**
 * Site navigation. Entries open their panels in a shared viewport below the list on desktop (hover, click or arrow
 * keys), and as stacked disclosures below 48rem. Arrow keys move between entries.
 * @summary Site navigation with panels.
 * @slot - `taqwa-navigation-menu-item` and `taqwa-navigation-menu-link` elements.
 * @csspart base - The `<nav>`.
 * @csspart list - The list of entries.
 * @csspart viewport - Shared frame behind the desktop panel.
 */
@customElement('taqwa-navigation-menu')
export class TaqwaNavigationMenu extends LitElement {
  static styles = unsafeCSS(styles);

  #ac?: AbortController;
  #unbindDismiss?: VoidFunction;

  render() {
    return html`<nav class="taqwa-navigation-menu" part="base">
      <ul class="taqwa-navigation-menu-list" part="list"><slot></slot></ul>
      <div class="taqwa-navigation-menu-viewport" part="viewport"></div>
    </nav>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.#ac = new AbortController();
    this.addEventListener('keydown', this.#onKeydown, { signal: this.#ac.signal });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#ac?.abort();
    this.#unbindDismiss?.();
    this.#unbindDismiss = undefined;
  }

  /** Opens `item`'s panel and closes the open one, or closes the open panel when `item` is `null`. */
  activate(item: TaqwaNavigationMenuItem | null, reason: NavigationReason = 'none') {
    const items = this.#items();
    const prev = items.find((i) => i.open) ?? null;
    const target = item ?? prev;
    if (item === prev || !target || !emit(target, 'open-change', { open: !!item, reason })) return;

    const direction = item && prev ? Math.sign(items.indexOf(item) - items.indexOf(prev)) : 0;
    prev?.showPanel(false, direction);
    item?.showPanel(true, direction);
    if (reason === 'escape-key') prev?.trigger?.focus();
    this.#frame(item);

    this.#unbindDismiss?.();
    this.#unbindDismiss = item
      ? onDismiss(
          () => [this],
          (how) => this.activate(null, how === 'escape' ? 'escape-key' : 'outside-press'),
        )
      : undefined;
  }

  #items() {
    return [...this.querySelectorAll<TaqwaNavigationMenuItem>(':scope > taqwa-navigation-menu-item')];
  }

  #frame(item: TaqwaNavigationMenuItem | null) {
    if (!desktop()) return;
    const frame = this.renderRoot.querySelector<HTMLElement>('.taqwa-navigation-menu-viewport')!;
    if (!item) {
      animate(frame, { opacity: 0 }, transition(quick)).then(() => {
        if (!this.#items().some((i) => i.open)) frame.style.visibility = 'hidden';
      });
      return;
    }

    const nav = this.renderRoot.querySelector('.taqwa-navigation-menu')!.getBoundingClientRect();
    const box = item.panel.getBoundingClientRect();
    const left = Math.max(0, Math.min(item.getBoundingClientRect().left - nav.left, nav.width - box.width));
    item.panel.style.left = `${left}px`;

    if (frame.style.visibility === 'visible') {
      animate(frame, { left, width: box.width, height: box.height }, transition(spring));
    } else {
      Object.assign(frame.style, { left: `${left}px`, width: `${box.width}px`, height: `${box.height}px`, visibility: 'visible' });
      animate(frame, { opacity: [0, 1] }, transition(spring));
    }
  }

  #onKeydown = (event: KeyboardEvent) => {
    const items = this.#items();
    const targets = items.map((item) => item.focusTarget);
    const current = targets.findIndex((el) => !!el && event.composedPath().includes(el));
    if (current < 0) return;

    if (event.key === 'ArrowDown' && items[current].trigger && !items[current].open) {
      event.preventDefault();
      this.activate(items[current], 'list-navigation');
      items[current].focusPanel();
      return;
    }

    const next = nextIndex(event.key, current, targets.length, { orientation: 'horizontal', loop: false, rtl: isRtl(this) });
    const target = next === undefined ? null : targets[next];
    if (target && next !== current) {
      event.preventDefault();
      target.focus();
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-navigation-menu': TaqwaNavigationMenu;
    'taqwa-navigation-menu-item': TaqwaNavigationMenuItem;
    'taqwa-navigation-menu-link': TaqwaNavigationMenuLink;
  }
}
