import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from './config';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Extract the locale from a URL pathname, falling back to the default locale. */
export function getLocaleFromUrl(url: URL): Locale {
  let path = url.pathname;
  if (BASE && path.startsWith(BASE)) path = path.slice(BASE.length);
  const [first] = path.split('/').filter(Boolean);
  return first && isLocale(first) ? first : DEFAULT_LOCALE;
}

/**
 * Build a localized, base-prefixed path.
 * `path` is the locale-agnostic portion, e.g. "/insight/" or "insight/foo".
 */
export function localizedPath(locale: Locale, path = '/'): string {
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '');
  const suffix = clean ? `/${clean}/` : '/';
  return `${BASE}/${locale}${suffix}`.replace(/\/{2,}/g, '/');
}

/** Given the current pathname, return the equivalent path in another locale. */
export function switchLocalePath(pathname: string, targetLocale: Locale): string {
  let path = pathname;
  if (BASE && path.startsWith(BASE)) path = path.slice(BASE.length);
  const parts = path.split('/').filter(Boolean);
  if (parts.length && isLocale(parts[0])) {
    parts[0] = targetLocale;
  } else {
    parts.unshift(targetLocale);
  }
  return `${BASE}/${parts.join('/')}/`.replace(/\/{2,}/g, '/');
}

export { LOCALES, DEFAULT_LOCALE };
