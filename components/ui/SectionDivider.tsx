'use client';

import { cn } from '@/lib/utils';

interface SectionDividerProps {
  className?: string;
  variant?: 'thin' | 'accent';
}

export function SectionDivider({ className = '', variant = 'thin' }: SectionDividerProps) {
  return (
    <div
      className={cn(
        'w-full',
        variant === 'thin' && 'border-t border-neutral-200 dark:border-neutral-800',
        variant === 'accent' && 'border-t border-[rgba(0,71,171,0.15)] dark:border-[rgba(0,71,171,0.3)]',
        className
      )}
    />
  );
}
