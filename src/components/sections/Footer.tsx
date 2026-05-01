'use client';

import { motion } from 'framer-motion';
import { GridPattern } from '@/components/icons/AbstractShapes';
import { Logo } from '@/components/ui/Logo';
import { ArrowUpRight } from 'lucide-react';
import { theme } from '../../../theme.config';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    services: [
      { label: t.footer.links.web, href: '#services' },
      { label: t.footer.links.mobile, href: '#services' },
      { label: t.footer.links.desktop, href: '#services' },
    ],
    company: [
      { label: t.footer.links.billing, href: '#billing' },
      { label: t.footer.links.process, href: '#process' },
      { label: t.footer.links.contact, href: '#contact' },
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
            <motion.div
              className="flex items-center gap-2 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: theme.animation.duration.slow }}
              viewport={{ once: true }}
            >
              <Logo size="md" variant="dark" />
            </motion.div>
            <p className="text-sm text-neutral-500 leading-[1.7] max-w-xs">
              {t.footer.description}
            </p>
          </div>

          {/* Links */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Services */}
            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-4">
                {t.footer.links.services}
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
                {t.footer.links.company}
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
                {t.footer.links.social}
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
            {t.footer.copyright.replace('{year}', String(currentYear))}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors">
              {t.footer.links.privacy}
            </a>
            <a href="#" className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors">
              {t.footer.links.terms}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
