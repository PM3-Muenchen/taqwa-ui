import * as Base from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type MotionProps, useReducedMotion } from 'motion/react';
import * as React from 'react';
import { cn, warnIfTailwindTransition } from './utils';

export const buttonVariants = cva(
  'taqwa-button',
  {
    variants: {
      variant: {
        primary: 'taqwa-button--primary',
        secondary: 'taqwa-button--secondary',
        tertiary: 'taqwa-button--tertiary',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

export interface ButtonProps
  extends Omit<Base.Button.Props, 'className' | 'render'>,
    VariantProps<typeof buttonVariants> {
  className?: Base.Button.Props['className'];
  motionProps?: MotionProps;
}

export const Button = React.forwardRef<HTMLElement, ButtonProps>(function Button(
  { className, motionProps, variant, ...props },
  ref,
) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Base.Button
      {...props}
      ref={ref}
      render={
        <motion.button
          {...(!prefersReducedMotion && !props.disabled && {
            whileHover: { scale: 1.02 },
            whileTap: { scale: 0.98 },
            transition: { duration: 0.15 },
          })}
          {...motionProps}
        />
      }
      className={(state) => {
        const resolvedClassName = typeof className === 'function' ? className(state) : className;
        warnIfTailwindTransition(resolvedClassName);
        return cn(buttonVariants({ variant }), resolvedClassName);
      }}
    />
  );
});
