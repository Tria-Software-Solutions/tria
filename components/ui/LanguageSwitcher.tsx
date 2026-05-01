'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { localeLabels } from '@/i18n/config';

export function LanguageSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('en');

  useEffect(() => {
    setMounted(true);
    // Get locale from cookie or default to 'en'
    const cookieMatch = document.cookie.match(/NEXT_LOCALE=(en|es)/);
    setCurrentLocale(cookieMatch ? cookieMatch[1] : 'en');
  }, []);

  const toggleLanguage = () => {
    const nextLocale = currentLocale === 'en' ? 'es' : 'en';
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    window.location.reload();
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
      aria-label={`Current language: ${localeLabels[currentLocale as 'en' | 'es']}. Click to switch.`}
      title={`Current: ${localeLabels[currentLocale as 'en' | 'es']}`}
    >
      <motion.span
        key={currentLocale}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
      >
        {localeLabels[currentLocale as 'en' | 'es']}
      </motion.span>
    </motion.button>
  );
}
