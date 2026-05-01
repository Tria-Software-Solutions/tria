'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Locale, defaultLocale } from '@/i18n/config';

// Import all message files
import enMessages from '@/messages/en.json';
import esMessages from '@/messages/es.json';

type Messages = typeof enMessages;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
  isLocaleLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const messages: Record<Locale, Messages> = {
  en: enMessages,
  es: esMessages,
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isLocaleLoaded, setIsLocaleLoaded] = useState(false);

  useEffect(() => {
    // Get locale from cookie or default to defaultLocale
    const cookieMatch = document.cookie.match(/NEXT_LOCALE=(en|es)/);
    const detectedLocale = (cookieMatch ? cookieMatch[1] : defaultLocale) as Locale;
    setLocaleState(detectedLocale);
    setIsLocaleLoaded(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
  };

  const value: LanguageContextType = {
    locale,
    setLocale,
    t: messages[locale],
    isLocaleLoaded,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
