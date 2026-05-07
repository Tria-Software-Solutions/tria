import { getLocale } from './request';
import esTranslations from '../../locales/es.json';
import enTranslations from '../../locales/en.json';

export function getTranslations(url?: URL) {
  const locale = getLocale(url);
  
  if (locale === 'en') {
    return enTranslations;
  }
  
  return esTranslations;
}

export type Translations = typeof enTranslations;

export * from './config';
export { getLocale, getLocaleFromPath } from './request';
