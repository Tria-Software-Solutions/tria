'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ElegantButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export function ElegantButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  href,
  type = 'button',
  disabled = false,
}: ElegantButtonProps) {
  const baseStyles = cn(
    'relative inline-flex items-center justify-center overflow-hidden font-medium tracking-wide transition-all',
    disabled && 'opacity-50 cursor-not-allowed',
    size === 'sm' && 'px-4 py-2 text-xs',
    size === 'md' && 'px-6 py-3 text-sm',
    size === 'lg' && 'px-8 py-4 text-base',
    variant === 'primary' && [
      'bg-black dark:bg-white text-white dark:text-black',
      'hover:bg-neutral-800 dark:hover:bg-neutral-200',
    ],
    variant === 'secondary' && [
      'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white',
      'hover:bg-neutral-200 dark:hover:bg-neutral-700',
    ],
    variant === 'outline' && [
      'bg-transparent text-black dark:text-white border border-neutral-300 dark:border-neutral-700',
      'hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-900',
    ],
    className
  );

  const content = (
    <>
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={baseStyles}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={baseStyles} type={type} disabled={disabled}>
      {content}
    </button>
  );
}
