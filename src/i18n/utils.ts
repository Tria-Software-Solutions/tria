import en from "./en.json";
import es from "./es.json";

const strings: Record<string, Record<string, string>> = { en, es };

function resolveKey(obj: Record<string, any>, key: string): string | null {
  if (typeof obj[key] === "string") return obj[key];
  const parts = key.split(".");
  let val: any = obj;
  for (const part of parts) {
    if (val == null || typeof val !== "object") return null;
    val = val[part];
  }
  return typeof val === "string" ? val : null;
}

export function createT(locale: string) {
  const dict = strings[locale] || strings.en;
  return (key: string): string => resolveKey(dict, key) ?? key;
}

export function localePath(locale: string, path: string) {
  if (locale === "en") return path;
  return `/${locale}${path}`;
}
