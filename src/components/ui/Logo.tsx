'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  withText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', variant = 'light', withText = true, className }: LogoProps) {
  const sizeMap = {
    sm: { icon: 20, text: 'text-xl', gap: 'gap-1.5' },
    md: { icon: 24, text: 'text-2xl', gap: 'gap-2' },
    lg: { icon: 32, text: 'text-3xl', gap: 'gap-2.5' }
  };

  const { icon: iconSize, text: textSize, gap } = sizeMap[size];

  const colors = variant === 'light' 
    ? {
        text: 'text-black dark:text-white',
        dot: 'text-[#0047AB]',
        icon: '/logo.svg'
      }
    : {
        text: 'text-white',
        dot: 'text-[#678DD6]',
        icon: '/logo-white.svg'
      };

  return (
    <div className={cn('flex items-center font-semibold tracking-[-0.025em]', gap, className)}>
      {/* Icon */}
      <motion.div
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <Image 
          src={colors.icon} 
          alt="tria" 
          width={iconSize} 
          height={iconSize}
          className="block"
        />
      </motion.div>

      {/* Text + Dot */}
      {withText && (
        <div className={cn('flex items-baseline', textSize)}>
          <span className={cn('transition-colors duration-300', colors.text)}>
            tria
          </span>
          <motion.span 
            className={cn('ml-1 transition-colors duration-300', colors.dot)}
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.2 }}
          >
            .
          </motion.span>
        </div>
      )}
    </div>
  );
}
