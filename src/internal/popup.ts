import { arrow, autoUpdate, computePosition, flip, offset, shift, size, type Placement, type ReferenceElement } from '@floating-ui/dom';
import type { Side } from './motion';

export type { Placement };

export interface AnchorOptions {
  placement?: Placement;
  /** Gap between anchor and popup in px. */
  offset?: number;
  arrow?: HTMLElement | null;
  /** Make the popup at least as wide as the anchor (select, combobox). */
  matchWidth?: boolean;
  /** Called after each reposition with the resolved side, e.g. to pick the enter animation direction. */
  onSide?: (side: Side) => void;
}

/**
 * Keeps `popup` (a `popover="manual"` element in the top layer) anchored to `reference`.
 * Sets `data-side` on the popup and returns a cleanup function.
 */
export function anchorPopup(reference: ReferenceElement, popup: HTMLElement, options: AnchorOptions = {}): VoidFunction {
  const { placement = 'bottom', offset: gap = 8, arrow: arrowEl, matchWidth = false, onSide } = options;
  Object.assign(popup.style, { position: 'fixed', margin: '0', inset: 'auto', left: '0', top: '0' });

  const update = async () => {
    const result = await computePosition(reference, popup, {
      strategy: 'fixed',
      placement,
      middleware: [
        offset(gap),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
        size({
          padding: 8,
          apply({ availableWidth, availableHeight, rects }) {
            Object.assign(popup.style, {
              maxWidth: `${Math.max(0, availableWidth)}px`,
              maxHeight: `${Math.max(0, availableHeight)}px`,
              minWidth: matchWidth ? `${rects.reference.width}px` : '',
            });
          },
        }),
        ...(arrowEl ? [arrow({ element: arrowEl, padding: 6 })] : []),
      ],
    });
    const side = result.placement.split('-')[0] as Side;
    Object.assign(popup.style, { left: `${result.x}px`, top: `${result.y}px` });
    popup.dataset.side = side;
    if (arrowEl && result.middlewareData.arrow) {
      const { x, y } = result.middlewareData.arrow;
      Object.assign(arrowEl.style, { left: x != null ? `${x}px` : '', top: y != null ? `${y}px` : '' });
      arrowEl.dataset.side = side;
    }
    onSide?.(side);
  };

  return autoUpdate(reference, popup, update);
}

/** A zero-size reference at a point, for context menus. */
export const pointReference = (x: number, y: number): ReferenceElement => ({
  getBoundingClientRect: () => DOMRect.fromRect({ x, y, width: 0, height: 0 }),
});

/**
 * Light dismiss: Escape and pointerdown outside every element returned by `inside()` (checked with
 * `composedPath`, so it works across shadow roots). Returns a cleanup function.
 */
export function onDismiss(
  inside: () => (Element | null | undefined)[],
  dismiss: (reason: 'escape' | 'outside') => void,
  { escape = true, outside = true } = {},
): VoidFunction {
  const onPointer = (event: PointerEvent) => {
    const path = event.composedPath();
    if (!inside().some((el) => el && path.includes(el))) dismiss('outside');
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !event.defaultPrevented) {
      event.preventDefault();
      dismiss('escape');
    }
  };
  if (outside) document.addEventListener('pointerdown', onPointer, true);
  if (escape) document.addEventListener('keydown', onKey);
  return () => {
    document.removeEventListener('pointerdown', onPointer, true);
    document.removeEventListener('keydown', onKey);
  };
}
