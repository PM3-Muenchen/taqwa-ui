import { animate, hover, press, type AnimationOptions, type DOMKeyframesDefinition } from 'motion';

export interface MotionOptions {
  hover?: DOMKeyframesDefinition;
  press?: DOMKeyframesDefinition;
  /** State animated back to when hover or press ends. */
  rest?: DOMKeyframesDefinition;
  transition?: AnimationOptions;
}

// Liquid glass: hover frosts the control, press swells it with a jelly spring (like iOS 26 controls).
export const glassMotion: Required<MotionOptions> = {
  hover: { '--_glass': 1, scale: 1.015 } as DOMKeyframesDefinition,
  press: { '--_glass': 1, scale: 1.04 } as DOMKeyframesDefinition,
  rest: { '--_glass': 0, scale: 1 } as DOMKeyframesDefinition,
  transition: { type: 'spring', visualDuration: 0.3, bounce: 0.35 },
};

/** Text fields frost on hover/press but never scale (a swelling text box feels wrong). */
export const fieldGlassMotion: Required<MotionOptions> = {
  ...glassMotion,
  hover: { '--_glass': 1 } as DOMKeyframesDefinition,
  press: { '--_glass': 1 } as DOMKeyframesDefinition,
  rest: { '--_glass': 0 } as DOMKeyframesDefinition,
};

/** SSR-safe: false outside the browser. */
export const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const instant: AnimationOptions = { duration: 0 };

/**
 * Glass hover/press feedback. Hover is mouse/pen only (Motion's `hover` ignores touch), so touch gets press only.
 * Explicit `options()` override the defaults and, like the button's `motionOptions`, ignore reduced motion.
 */
export function bindGlassMotion(
  target: HTMLElement,
  {
    disabled = () => false,
    options = () => undefined,
    preset = glassMotion,
  }: { disabled?: () => boolean; options?: () => MotionOptions | undefined; preset?: Required<MotionOptions> } = {},
): VoidFunction {
  const resolve = () => ({ ...preset, ...options() });
  const play = (state: 'hover' | 'press' | 'rest', force = false) => {
    const custom = options();
    const { [state]: keyframes, transition } = resolve();
    if (!force && disabled()) return;
    animate(target, keyframes, !custom && prefersReducedMotion() ? instant : transition);
  };
  let hovered = false;
  // Specular highlight follows the pointer.
  const track = (event: PointerEvent) => {
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--_glass-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    target.style.setProperty('--_glass-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };
  target.addEventListener('pointermove', track);
  target.addEventListener('pointerdown', track);
  const unbind = [
    () => target.removeEventListener('pointermove', track),
    () => target.removeEventListener('pointerdown', track),
    hover(target, () => {
      hovered = true;
      play('hover');
      return () => {
        hovered = false;
        play('rest', true);
      };
    }),
    press(target, () => {
      play('press');
      return () => play(hovered ? 'hover' : 'rest', !hovered);
    }),
  ];
  return () => unbind.forEach((fn) => fn());
}

/** Animate the glass level directly, e.g. for keyboard-highlighted list items (0 = rest, 1 = full glass). */
export function animateGlass(target: Element, level: number) {
  return animate(target, { '--_glass': level } as DOMKeyframesDefinition, prefersReducedMotion() ? instant : glassMotion.transition);
}

export type Side = 'top' | 'right' | 'bottom' | 'left';

const offsets: Record<Side, { x?: number; y?: number }> = {
  top: { y: 6 },
  bottom: { y: -6 },
  left: { x: 6 },
  right: { x: -6 },
};

/** Popup enter: frosted blur + scale + fade, nudged in from `side`. */
export function animatePopupIn(target: HTMLElement, side: Side = 'bottom') {
  const { x = 0, y = 0 } = offsets[side];
  return animate(
    target,
    { opacity: [0, 1], scale: [0.96, 1], x: [x, 0], y: [y, 0], filter: ['blur(6px)', 'blur(0px)'] },
    prefersReducedMotion() ? instant : { type: 'spring', visualDuration: 0.24, bounce: 0.12 },
  );
}

/** Popup exit. Await it before hiding the element (`hidePopover()`, `dialog.close()`, …). */
export function animatePopupOut(target: HTMLElement, side: Side = 'bottom') {
  const { x = 0, y = 0 } = offsets[side];
  return animate(
    target,
    { opacity: 0, scale: 0.97, x, y, filter: 'blur(4px)' },
    prefersReducedMotion() ? instant : { duration: 0.14, ease: 'easeIn' },
  );
}

/** Height expand/collapse for accordion & collapsible panels. */
export function animateHeight(target: HTMLElement, open: boolean) {
  const from = target.getBoundingClientRect().height;
  target.style.height = 'auto';
  const to = open ? target.getBoundingClientRect().height : 0;
  return animate(
    target,
    { height: [from, to], opacity: open ? 1 : 0 },
    prefersReducedMotion() ? instant : { type: 'spring', visualDuration: 0.26, bounce: 0 },
  ).then(() => {
    target.style.height = open ? 'auto' : '0px';
  });
}
