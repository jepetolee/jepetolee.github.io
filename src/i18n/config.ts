export const LOCALES = ['ko', 'en', 'es', 'ja', 'zh', 'ru', 'fr', 'de'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ko';

export interface LocaleMeta {
  /** Native language label shown in the language switcher */
  label: string;
  /** Value for the <html lang> attribute */
  htmlLang: string;
  /** BCP-47 tag for Intl formatting (dates, numbers) */
  bcp47: string;
  /** Giscus data-lang value */
  giscus: string;
  /** Language tag used by the sitemap i18n integration */
  sitemap: string;
  /** og:locale value */
  ogLocale: string;
  /** Writing direction */
  dir: 'ltr' | 'rtl';
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  ko: { label: '한국어', htmlLang: 'ko', bcp47: 'ko-KR', giscus: 'ko', sitemap: 'ko-KR', ogLocale: 'ko_KR', dir: 'ltr' },
  en: { label: 'English', htmlLang: 'en', bcp47: 'en-US', giscus: 'en', sitemap: 'en-US', ogLocale: 'en_US', dir: 'ltr' },
  es: { label: 'Español', htmlLang: 'es', bcp47: 'es-ES', giscus: 'es', sitemap: 'es-ES', ogLocale: 'es_ES', dir: 'ltr' },
  ja: { label: '日本語', htmlLang: 'ja', bcp47: 'ja-JP', giscus: 'ja', sitemap: 'ja-JP', ogLocale: 'ja_JP', dir: 'ltr' },
  zh: { label: '中文', htmlLang: 'zh-CN', bcp47: 'zh-CN', giscus: 'zh-CN', sitemap: 'zh-CN', ogLocale: 'zh_CN', dir: 'ltr' },
  ru: { label: 'Русский', htmlLang: 'ru', bcp47: 'ru-RU', giscus: 'ru', sitemap: 'ru-RU', ogLocale: 'ru_RU', dir: 'ltr' },
  fr: { label: 'Français', htmlLang: 'fr', bcp47: 'fr-FR', giscus: 'fr', sitemap: 'fr-FR', ogLocale: 'fr_FR', dir: 'ltr' },
  de: { label: 'Deutsch', htmlLang: 'de', bcp47: 'de-DE', giscus: 'de', sitemap: 'de-DE', ogLocale: 'de_DE', dir: 'ltr' },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
