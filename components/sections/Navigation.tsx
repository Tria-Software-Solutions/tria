'use client';

import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import messages from '@/messages/es.json';

export function Navigation() {
  const t = messages.nav;

  const navLinks = [
    { label: t.services, href: '#services' },
    { label: t.billing, href: '#billing' },
    { label: t.process, href: '#process' },
    { label: t.contact, href: '#contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <nav className="flex items-center justify-between h-20">
          <a href="#">
            <Logo size="md" variant="light" />
          </a>

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
            <div className="flex items-center gap-2 pl-4 border-l border-neutral-200 dark:border-neutral-800">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            <a
              href="#contact"
              className="text-sm font-medium text-black dark:text-white hover:text-[#0047AB] transition-colors"
            >
              {t.cta}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
