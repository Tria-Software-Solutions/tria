'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { localeLabels } from '@/i18n/config';
import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { locale, setLocale } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'es' : 'en';
    setLocale(nextLocale);
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-700" />
    );
  }

  return (
    <motion.button
      onClick={toggleLanguage}
      className="w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-xs font-semibold tracking-wider text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Current language: ${localeLabels[locale]}. Click to switch.`}
      title={`Current: ${localeLabels[locale]}`}
    >
      <motion.span
        key={locale}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
      >
        {localeLabels[locale]}
      </motion.span>
    </motion.button>
  );
}
