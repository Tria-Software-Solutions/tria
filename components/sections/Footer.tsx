'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { GridPattern } from '@/components/icons/AbstractShapes';
import { ArrowUpRight } from 'lucide-react';
import { theme } from '@/theme.config';

export function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    services: [
      { label: t('links.data'), href: '#services' },
      { label: t('links.security'), href: '#services' },
      { label: t('links.hpc'), href: '#services' },
    ],
    company: [
      { label: t('links.process'), href: '#process' },
      { label: t('links.contact'), href: '#contact' },
    ],
    social: [
      { label: 'LinkedIn', href: '#' },
      { label: 'GitHub', href: '#' },
      { label: 'Twitter', href: '#' },
    ],
  };

  return (
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 text-neutral-800 opacity-30">
        <GridPattern className="absolute inset-0" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-8">
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-neutral-800">
          {/* Brand */}
          <div className="lg:col-span-5">
            <motion.h3
              className="text-3xl font-semibold tracking-[-0.03em] mb-4 flex items-baseline text-white"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: theme.animation.duration.slow }}
              viewport={{ once: true }}
            >
              tria<span className="text-[#0047AB] ml-[2px]">.</span>
            </motion.h3>
            <p className="text-sm text-neutral-500 leading-[1.7] max-w-xs">
              {t('description')}
            </p>
          </div>

          {/* Links */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Services */}
            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-4">
                {t('links.services')}
              </h4>
              <ul className="space-y-3">
                {footerLinks.services.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href}
                      className="group text-sm text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-4">
                {t('links.company')}
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href}
                      className="group text-sm text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-4">
                {t('links.social')}
              </h4>
              <ul className="space-y-3">
                {footerLinks.social.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href}
                      className="group text-sm text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-xs text-neutral-500 tracking-wide">
            {t('copyright').replace('{year}', currentYear.toString())}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors">
              {t('links.privacy')}
            </a>
            <a href="#" className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors">
              {t('links.terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
