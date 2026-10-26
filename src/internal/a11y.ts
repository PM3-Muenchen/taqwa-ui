let counter = 0;

/** Unique id for ARIA wiring. Ids only resolve inside one tree scope, so keep each pair within one shadow root (or both in light DOM). */
export const uid = (prefix = 'taqwa') => `${prefix}-${++counter}`;

export type Orientation = 'horizontal' | 'vertical';

/**
 * Roving-focus index for arrow/Home/End keys. Returns the next index, or `undefined` if the key is not handled.
 * Skips indices where `isDisabled(i)` is true. Respects RTL for horizontal arrows.
 */
export function nextIndex(
  key: string,
  current: number,
  count: number,
  { orientation = 'horizontal', loop = true, rtl = false, isDisabled = () => false }: {
    orientation?: Orientation | 'both';
    loop?: boolean;
    rtl?: boolean;
    isDisabled?: (index: number) => boolean;
  } = {},
): number | undefined {
  const horizontal = orientation !== 'vertical';
  const vertical = orientation !== 'horizontal';
  let step: number;
  let start = current;
  if (key === 'Home') [start, step] = [-1, 1];
  else if (key === 'End') [start, step] = [count, -1];
  else if ((key === 'ArrowRight' && horizontal) || (key === 'ArrowDown' && vertical)) step = key === 'ArrowRight' && rtl ? -1 : 1;
  else if ((key === 'ArrowLeft' && horizontal) || (key === 'ArrowUp' && vertical)) step = key === 'ArrowLeft' && rtl ? 1 : -1;
  else return undefined;

  for (let i = 1, index = start; i <= count; i++) {
    index += step;
    if (index < 0 || index >= count) {
      if (!loop || key === 'Home' || key === 'End') return current;
      index = (index + count) % count;
    }
    if (!isDisabled(index)) return index;
  }
  return current;
}

/** Type-to-select: returns a handler that, given a key, finds the next matching label index. */
export function typeahead(labels: () => string[], timeout = 500) {
  let query = '';
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (key: string, current: number): number | undefined => {
    if (key.length !== 1) return undefined;
    clearTimeout(timer);
    timer = setTimeout(() => (query = ''), timeout);
    query += key.toLowerCase();
    const items = labels();
    const same = query.split('').every((c) => c === query[0]);
    const search = same ? query[0] : query;
    for (let i = 1; i <= items.length; i++) {
      const index = (current + (same ? i : i - 1) + items.length) % items.length;
      if (items[index]?.trim().toLowerCase().startsWith(search)) return index;
    }
    return undefined;
  };
}

export const isRtl = (el: Element) => getComputedStyle(el).direction === 'rtl';
