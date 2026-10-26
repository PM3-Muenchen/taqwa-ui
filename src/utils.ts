/// <reference types="vite/client" />

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export { cva, cx, type VariantProps } from 'class-variance-authority';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const tailwindTransitionClass = /(?:^|\s)(?:[\w-]+:)*(?:transition(?:-[\w\[\]/.-]+)?|duration-[\w\[\]/.-]+|ease-[\w\[\]/.-]+|delay-[\w\[\]/.-]+)(?=\s|$)/;

export function warnIfTailwindTransition(className: string | undefined) {
  if (import.meta.env.DEV && className && tailwindTransitionClass.test(className)) {
    console.warn('Use motionProps instead of Tailwind transition utilities.');
  }
}
