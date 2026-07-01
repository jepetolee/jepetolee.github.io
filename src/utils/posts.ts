import { getCollection, type CollectionEntry } from 'astro:content';
import { CANONICAL_TAG_NAMES, compareTags } from '../taxonomy';
import { DEFAULT_LOCALE, isLocale, type Locale } from '../i18n/config';
import { localizedPath } from '../i18n/utils';

export type Post = CollectionEntry<'posts'>;
export type Paper = CollectionEntry<'papers'>;

/** Split a collection entry id ("<locale>/<slug>") into its locale and slug. */
export function parseId(id: string): { locale: Locale; slug: string } {
  const [maybeLocale, ...rest] = id.split('/');
  if (rest.length > 0 && isLocale(maybeLocale)) {
    return { locale: maybeLocale, slug: rest.join('/') };
  }
  return { locale: DEFAULT_LOCALE, slug: id };
}

/** The locale-agnostic slug (translation key) of an entry. */
export function slugOf(entry: { id: string }): string {
  return parseId(entry.id).slug;
}

/**
 * Pick one entry per slug for the requested locale, falling back to the
 * default locale (then any available locale) when a translation is missing.
 */
function resolveByLocale<T extends { id: string }>(entries: T[], locale: Locale): T[] {
  const bySlug = new Map<string, Map<Locale, T>>();
  for (const entry of entries) {
    const { locale: entryLocale, slug } = parseId(entry.id);
    if (!bySlug.has(slug)) bySlug.set(slug, new Map());
    bySlug.get(slug)!.set(entryLocale, entry);
  }
  const result: T[] = [];
  for (const byLocale of bySlug.values()) {
    const entry =
      byLocale.get(locale) ?? byLocale.get(DEFAULT_LOCALE) ?? [...byLocale.values()][0];
    if (entry) result.push(entry);
  }
  return result;
}

export async function getPublishedPosts(locale: Locale): Promise<Post[]> {
  const all = await getCollection('posts', ({ data }) => !data.draft);
  return resolveByLocale(all, locale).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

export async function getPapers(locale: Locale): Promise<Paper[]> {
  const all = await getCollection('papers', ({ data }) => !data.draft);
  return resolveByLocale(all, locale).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

/**
 * reference 순서대로 정렬: 어떤 리뷰가 참고한 선행 논문이 항상 앞에 오도록 위상 정렬.
 * references는 로케일 무관 slug로 해석한다.
 */
export function sortByReferenceOrder(papers: Paper[]): Paper[] {
  const bySlug = new Map(papers.map((p) => [slugOf(p), p]));
  const visited = new Set<string>();
  const result: Paper[] = [];
  const visit = (p: Paper) => {
    const slug = slugOf(p);
    if (visited.has(slug)) return;
    visited.add(slug);
    for (const refSlug of p.data.references) {
      const ref = bySlug.get(refSlug);
      if (ref) visit(ref);
    }
    result.push(p);
  };
  const base = [...papers].sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
  for (const p of base) visit(p);
  return result;
}

/**
 * 카테고리 세부항목화: 대분류 -> 소분류 -> (reference 순서로 정렬된) 리뷰 목록
 */
export async function getPaperCategoryTree(
  locale: Locale,
): Promise<Map<string, Map<string, Paper[]>>> {
  const papers = await getPapers(locale);
  const ordered = sortByReferenceOrder(papers);
  const tree = new Map<string, Map<string, Paper[]>>();
  for (const paper of ordered) {
    const cat = paper.data.category;
    const sub = paper.data.subcategory ?? '일반';
    if (!tree.has(cat)) tree.set(cat, new Map());
    const subMap = tree.get(cat)!;
    if (!subMap.has(sub)) subMap.set(sub, []);
    subMap.get(sub)!.push(paper);
  }
  return tree;
}

/** 이 리뷰가 참고한 선행 논문 리뷰들 (reference 순서 유지, 현재 로케일 폴백) */
export async function getPaperReferences(paper: Paper, locale: Locale): Promise<Paper[]> {
  const papers = await getPapers(locale);
  const bySlug = new Map(papers.map((p) => [slugOf(p), p]));
  return paper.data.references
    .map((slug) => bySlug.get(slug))
    .filter((p): p is Paper => !!p);
}

/** 이 논문 리뷰를 참고한(인용한) 후속 리뷰들 */
export async function getPapersCiting(paper: Paper, locale: Locale): Promise<Paper[]> {
  const papers = await getPapers(locale);
  const slug = slugOf(paper);
  return papers
    .filter((p) => p.data.references.includes(slug))
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
}

export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  // Korean-aware: count CJK chars + word tokens
  const cjk = (body.match(/[\u3131-\uD79D]/g) || []).length;
  const words = body.replace(/[\u3131-\uD79D]/g, '').split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(cjk / 500 + words / 200);
  return Math.max(1, minutes);
}

export function postUrl(locale: Locale, slug: string): string {
  return localizedPath(locale, `insight/${slug}`);
}

export function paperUrl(locale: Locale, slug: string): string {
  return localizedPath(locale, `papers/${slug}`);
}

export async function getAllTags(
  locale: Locale,
): Promise<{ tag: string; count: number }[]> {
  const posts = await getPublishedPosts(locale);
  const papers = await getPapers(locale);
  const counts = new Map<string, number>();
  for (const tag of CANONICAL_TAG_NAMES) {
    counts.set(tag, 0);
  }
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  for (const paper of papers) {
    for (const tag of paper.data.tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => compareTags(a.tag, b.tag) || b.count - a.count);
}

export async function getSeries(locale: Locale): Promise<Map<string, Post[]>> {
  const posts = await getPublishedPosts(locale);
  const series = new Map<string, Post[]>();
  for (const post of posts) {
    if (post.data.series) {
      const list = series.get(post.data.series) || [];
      list.push(post);
      series.set(post.data.series, list);
    }
  }
  // chronological within a series (oldest first)
  for (const [key, list] of series) {
    list.sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
    series.set(key, list);
  }
  return series;
}
