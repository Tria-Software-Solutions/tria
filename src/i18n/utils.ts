import en from "./en.json";
import es from "./es.json";

export type Locale = "en" | "es";

type TranslationDict = Record<string, string>;
const strings: Record<Locale, TranslationDict> = { en, es };

export function getLocale(): Locale {
  if (typeof Astro !== "undefined" && Astro.currentLocale) {
    return Astro.currentLocale as Locale;
  }
  if (typeof window !== "undefined") {
    const m = window.location.pathname.match(/^\/(en|es)(\/|$)/);
    if (m) return m[1] as Locale;
  }
  return "en";
}

function resolveKey(obj: TranslationDict, key: string): string | null {
  if (typeof obj[key] === "string") return obj[key];
  const parts = key.split(".");
  let val: any = obj;
  for (const part of parts) {
    if (val == null || typeof val !== "object") return null;
    val = val[part];
  }
  return typeof val === "string" ? val : null;
}

function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] != null ? String(params[key]) : `{${key}}`
  );
}

export function createT(locale: string) {
  const dict = strings[locale as Locale] || strings.en;
  return (key: string, params?: Record<string, string | number>): string => {
    const val = resolveKey(dict, key);
    return val != null ? interpolate(val, params) : key;
  };
}

export function localePath(locale: string, path: string) {
  if (locale === "en") return path;
  return `/${locale}${path}`;
}

export function formatDate(
  date: string | Date,
  locale: string = "en",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const localeTag = locale === "es" ? "es-CR" : "en-US";
  return d.toLocaleDateString(localeTag, options || {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatNumber(
  n: number,
  locale: string = "en",
  options?: Intl.NumberFormatOptions
): string {
  const localeTag = locale === "es" ? "es-CR" : "en-US";
  return new Intl.NumberFormat(localeTag, options).format(n);
}

export function translate(
  key: string,
  locale?: string,
  params?: Record<string, string | number>
): string {
  return createT(locale || getLocale())(key, params);
}
