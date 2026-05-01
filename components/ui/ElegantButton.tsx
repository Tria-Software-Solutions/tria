'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { theme } from '@/theme.config';

interface ElegantButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function ElegantButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  href,
}: ElegantButtonProps) {
  const baseStyles = cn(
    'relative inline-flex items-center justify-center overflow-hidden font-medium tracking-wide transition-all',
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
      {/* Text layer with slide effect */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      
      {/* Hover indicator line */}
      <motion.span
        className={cn(
          'absolute bottom-0 left-0 h-[1px] w-full origin-left',
          variant === 'primary' ? 'bg-white/30 dark:bg-black/20' : 'bg-black/20 dark:bg-white/20'
        )}
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: theme.animation.duration.normal, ease: theme.animation.easing.smooth }}
      />
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={baseStyles}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: theme.animation.duration.fast, ease: theme.animation.easing.smooth }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      className={baseStyles}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: theme.animation.duration.fast, ease: theme.animation.easing.smooth }}
    >
      {content}
    </motion.button>
  );
}
