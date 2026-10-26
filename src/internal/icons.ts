import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { IconNode } from 'lucide';
export {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Circle,
  CircleAlert,
  CircleCheck,
  Info,
  LoaderCircle,
  Minus,
  Plus,
  Search,
  TriangleAlert,
  User,
  X,
} from 'lucide';

const cache = new WeakMap<IconNode, string>();
const escape = (value: unknown) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Renders a Lucide icon inline. Decorative by default (`aria-hidden`). Size follows `1em` unless given. */
export function icon(node: IconNode, size: string | number = '1em'): ReturnType<typeof unsafeSVG> {
  let inner = cache.get(node);
  if (inner === undefined) {
    inner = node
      .map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${escape(v)}"`).join(' ')}/>`)
      .join('');
    cache.set(node, inner);
  }
  return unsafeSVG(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`,
  );
}
