'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

// Import messages directly for now
import enMessages from '../messages/en.json';
import esMessages from '../messages/es.json';

interface IntlProviderProps {
  children: ReactNode;
}

export function IntlProvider({ children }: IntlProviderProps) {
  // Get locale from cookie
  const cookieLocale = typeof document !== 'undefined' 
    ? document.cookie
        .split('; ')
        .find(row => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1] || 'en'
    : 'en';

  const messages = cookieLocale === 'es' ? esMessages : enMessages;

  return (
    <NextIntlClientProvider messages={messages} locale={cookieLocale}>
      {children}
    </NextIntlClientProvider>
  );
}
