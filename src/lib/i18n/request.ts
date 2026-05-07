import { defaultLocale, locales } from './config';

export type Locale = typeof locales[number];

export function getLocale(url?: URL): Locale {
  // Get locale from URL parameter (server-side)
  if (url) {
    const urlLang = url.searchParams.get('lang') as Locale;
    if (urlLang && (locales as readonly string[]).indexOf(urlLang) !== -1) {
      return urlLang;
    }
  }
  
  // Get locale from browser (client-side only)
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    // Check for saved preference in localStorage
    try {
      const savedLang = localStorage.getItem('preferred-lang') as Locale;
      if (savedLang && (locales as readonly string[]).indexOf(savedLang) !== -1) {
        return savedLang;
      }
    } catch (e) {
      // localStorage might not be available in some environments
    }
    
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
