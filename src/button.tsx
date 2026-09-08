import * as Base from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from './utils';

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
  extends Omit<Base.Button.Props, 'className'>,
    VariantProps<typeof buttonVariants> {
  className?: Base.Button.Props['className'];
}

export const Button = React.forwardRef<HTMLElement, ButtonProps>(function Button(
  { className, variant, ...props },
  ref,
) {
  return (
    <Base.Button
      {...props}
      ref={ref}
      className={(state) =>
        cn(buttonVariants({ variant }), typeof className === 'function' ? className(state) : className)
      }
    />
  );
});
