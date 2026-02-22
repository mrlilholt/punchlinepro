import type { ButtonHTMLAttributes } from 'react';

import { merge_class_names } from '../../utils/merge_class_names';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variant_class_map: Record<ButtonVariant, string> = {
  primary: 'ui-button-primary',
  secondary: 'ui-button-secondary',
  ghost: 'ui-button-ghost',
};

export function Button({
  children,
  className,
  variant = 'primary',
  type = 'button',
  ...button_props
}: ButtonProps) {
  return (
    <button
      className={merge_class_names('ui-button', variant_class_map[variant], className)}
      type={type}
      {...button_props}
    >
      {children}
    </button>
  );
}
