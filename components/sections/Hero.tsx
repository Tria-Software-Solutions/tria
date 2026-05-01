'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ElegantButton } from '@/components/ui/ElegantButton';
import { GridPattern } from '@/components/icons/AbstractShapes';
import { theme } from '@/theme.config';

export function Hero() {
  const t = useTranslations('hero');
  
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
      {/* Background patterns */}
      <div className="absolute inset-0 text-neutral-300 dark:text-neutral-700">
        <GridPattern className="absolute inset-0 opacity-50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 text-center">
        {/* Eyebrow */}
        <motion.p
          className="text-xs tracking-[0.25em] uppercase text-neutral-500 dark:text-neutral-400 mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.animation.duration.slow, ease: theme.animation.easing.elegant }}
        >
          {t('eyebrow')}
        </motion.p>

        {/* Main headline */}
        <motion.h1
          className="text-black dark:text-white leading-[1.08] tracking-[-0.03em] mb-10"
          style={{ fontSize: theme.typography.sizes['display-xl'] }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.animation.duration.slower, delay: 0.1, ease: theme.animation.easing.elegant }}
        >
          {t('headline').split(' ').map((word: string, index: number) => (
            <span key={index}>
              {word}
              {index < 2 && <br />}
            </span>
          ))}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-neutral-600 dark:text-neutral-300 max-w-lg mx-auto mb-14 leading-[1.7]"
          style={{ fontSize: theme.typography.sizes['body-sm'] }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.animation.duration.slower, delay: 0.2, ease: theme.animation.easing.elegant }}
        >
          {t('subtitle')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.animation.duration.slower, delay: 0.3, ease: theme.animation.easing.elegant }}
        >
          <ElegantButton variant="primary" size="lg" href="#contact">
            {t('ctaPrimary')}
          </ElegantButton>
          <ElegantButton variant="outline" size="lg" href="#services">
            {t('ctaSecondary')}
          </ElegantButton>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <motion.div
            className="w-[1px] h-16 bg-gradient-to-b from-neutral-400 dark:from-neutral-500 to-transparent"
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>

      {/* Thin border line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-neutral-300 dark:bg-neutral-700" />
    </section>
  );
}
