import { LitElement, html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { animate } from 'motion';
import { User, icon } from './internal/icons';
import { prefersReducedMotion } from './internal/motion';
import styles from './avatar.css?inline';

export type AvatarImageStatus = 'idle' | 'loading' | 'loaded' | 'error';

const emit = (target: EventTarget, type: string, detail: unknown) =>
  target.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true, cancelable: true }));

/**
 * A user's picture, falling back to initials (default slot) or a generic user icon while the image loads or when it fails.
 *
 * @summary Profile picture with an initials or icon fallback.
 * @fires loading-status-change - Fired when the image status changes, `detail: { status }`.
 * @slot - Fallback content, typically initials. Defaults to a user icon.
 * @csspart base - Circular wrapper.
 * @csspart image - The picture, faded in with motion once loaded.
 * @csspart fallback - Fallback content, shown until the image has loaded.
 * @cssprop --taqwa-avatar-size - Width and height of the avatar. Defaults to 2.5rem.
 */
@customElement('taqwa-avatar')
export class TaqwaAvatar extends LitElement {
  static styles = unsafeCSS(styles);

  @property() src?: string;
  @property() alt = '';
  /** Milliseconds to wait before showing the fallback while the image loads. */
  @property({ type: Number }) delay = 0;

  @state() private status: AvatarImageStatus = 'idle';
  @state() private delayed = true;

  #timer?: ReturnType<typeof setTimeout>;

  render() {
    const showImage = !!this.src && this.status !== 'error';
    const showFallback = this.status !== 'loaded' && this.delayed;
    return html`<span part="base" class="taqwa-avatar" data-status=${this.status}>
      ${showImage
        ? html`<img
            part="image"
            class="taqwa-avatar-image"
            src=${this.src!}
            alt=${this.alt}
            @load=${this.#onLoad}
            @error=${() => this.#setStatus('error')}
          />`
        : nothing}
      ${showFallback ? html`<span part="fallback" class="taqwa-avatar-fallback"><slot>${icon(User, '55%')}</slot></span>` : nothing}
    </span>`;
  }

  willUpdate(changed: PropertyValues<this>) {
    if (!changed.has('src')) return;
    clearTimeout(this.#timer);
    this.status = this.src ? 'loading' : 'idle';
    this.delayed = !this.src || this.delay <= 0;
    if (!this.delayed) this.#timer = setTimeout(() => (this.delayed = true), this.delay);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.#timer);
  }

  #onLoad(event: Event) {
    this.#setStatus('loaded');
    animate(
      event.currentTarget as HTMLElement,
      { opacity: [0, 1], scale: [1.04, 1] },
      prefersReducedMotion() ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' },
    );
  }

  #setStatus(status: AvatarImageStatus) {
    if (this.status === status) return;
    this.status = status;
    emit(this, 'loading-status-change', { status });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'taqwa-avatar': TaqwaAvatar;
  }
}
