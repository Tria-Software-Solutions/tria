import { defaultLocale, locales } from './config';

export type Locale = typeof locales[number];

export function getLocale(): Locale {
  // Get locale from browser
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language || navigator.languages?.[0] || defaultLocale;
    const locale = browserLang.split('-')[0] as Locale;
    
    // Check if the detected locale is supported
    if ((locales as readonly string[]).indexOf(locale) !== -1) {
      return locale;
    }
  }
  
  // Fallback to default locale
  return defaultLocale as Locale;
}

export function getLocaleFromPath(pathname: string): Locale {
  // Extract locale from URL path
  const pathSegments = pathname.split('/');
  const localeSegment = pathSegments[1];
  
  if (localeSegment && (locales as readonly string[]).indexOf(localeSegment as Locale) !== -1) {
    return localeSegment as Locale;
  }
  
  return defaultLocale as Locale;
}
