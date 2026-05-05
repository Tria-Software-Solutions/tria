export const defaultLocale = 'es';

export const locales = ['es', 'en'] as const;

export type Locale = typeof locales[number];

export const localeNames = {
  es: 'Español',
  en: 'English',
} as const;
