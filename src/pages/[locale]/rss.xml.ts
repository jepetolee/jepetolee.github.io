import rss from '@astrojs/rss';
import type { APIContext, GetStaticPaths } from 'astro';
import { getPublishedPosts, getPapers, slugOf } from '../../utils/posts';
import { SITE } from '../../config';
import { DEFAULT_LOCALE, isLocale, LOCALE_META, LOCALES } from '../../i18n/config';
import { useTranslations } from '../../i18n/ui';

export const getStaticPaths = (() =>
  LOCALES.map((locale) => ({ params: { locale } }))) satisfies GetStaticPaths;

export async function GET(context: APIContext) {
  const param = context.params.locale;
  const locale = param && isLocale(param) ? param : DEFAULT_LOCALE;
  const t = useTranslations(locale);
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  const posts = await getPublishedPosts(locale);
  const papers = await getPapers(locale);

  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description ?? '',
      link: `${base}/${locale}/insight/${slugOf(post)}/`,
      categories: post.data.tags,
    })),
    ...papers.map((paper) => ({
      title: `[${t('papers.title')}] ${paper.data.title}`,
      pubDate: paper.data.date,
      description: paper.data.description ?? '',
      link: `${base}/${locale}/papers/${slugOf(paper)}/`,
      categories: paper.data.tags,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: `${SITE.title} (${LOCALE_META[locale].label})`,
    description: t('site.description'),
    site: context.site ?? SITE.url,
    items,
    customData: `<language>${LOCALE_META[locale].htmlLang}</language>`,
  });
}
