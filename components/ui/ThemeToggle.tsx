'use client';

import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-700" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? (
          <Moon size={16} strokeWidth={1.5} />
        ) : (
          <Sun size={16} strokeWidth={1.5} />
        )}
      </motion.div>
    </motion.button>
  );
}
