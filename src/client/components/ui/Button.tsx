import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

function classNames(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function Button({ variant = 'primary', loading = false, className, children, disabled, ...props }: ButtonProps) {
  const base = 'btn';
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    outline: 'btn-outline',
  }[variant];

  return (
    <button
      className={classNames(base, variantClass, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Laster...' : children}
    </button>
  );
}

export default Button;

