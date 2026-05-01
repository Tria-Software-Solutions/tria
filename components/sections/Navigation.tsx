'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ElegantButton } from '@/components/ui/ElegantButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { theme } from '@/theme.config';

export function Navigation() {
  const t = useTranslations('nav');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: t('services'), href: '#services' },
    { label: t('process'), href: '#process' },
    { label: t('contact'), href: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800'
            : 'bg-transparent'
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: theme.animation.duration.slow, ease: theme.animation.easing.elegant }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <nav className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#" className="text-2xl font-semibold tracking-[-0.03em] text-black dark:text-white flex items-baseline">
              tria<span className="text-[var(--accent)] ml-[2px]">.</span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center gap-3 pl-4 border-l border-neutral-200 dark:border-neutral-800">
                <LanguageSwitcher />
                <ThemeToggle />
                <ElegantButton variant="primary" size="sm" href="#contact">
                  {t('cta')}
                </ElegantButton>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 md:hidden">
              <LanguageSwitcher />
              <ThemeToggle />
              <button
                className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-white dark:bg-neutral-950 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="text-2xl font-medium text-black dark:text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.3 }}
              >
                <ElegantButton variant="primary" size="lg" href="#contact" className="mt-4">
                  {t('cta')}
                </ElegantButton>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
