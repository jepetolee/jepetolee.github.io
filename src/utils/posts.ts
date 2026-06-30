import { getCollection, type CollectionEntry } from 'astro:content';

export async function getPublishedPosts(): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export type Paper = CollectionEntry<'papers'>;

export async function getPapers(): Promise<Paper[]> {
  const papers = await getCollection('papers', ({ data }) => !data.draft);
  return papers.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/**
 * reference 순서대로 정렬: 어떤 리뷰가 참고한 선행 논문이 항상 앞에 오도록 위상 정렬.
 */
export function sortByReferenceOrder(papers: Paper[]): Paper[] {
  const byId = new Map(papers.map((p) => [p.id, p]));
  const visited = new Set<string>();
  const result: Paper[] = [];
  const visit = (p: Paper) => {
    if (visited.has(p.id)) return;
    visited.add(p.id);
    for (const refId of p.data.references) {
      const ref = byId.get(refId);
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
export async function getPaperCategoryTree(): Promise<
  Map<string, Map<string, Paper[]>>
> {
  const papers = await getPapers();
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

/** 이 리뷰가 참고한 선행 논문 리뷰들 (reference 순서 유지) */
export async function getPaperReferences(paper: Paper): Promise<Paper[]> {
  const papers = await getPapers();
  const byId = new Map(papers.map((p) => [p.id, p]));
  return paper.data.references.map((id) => byId.get(id)).filter((p): p is Paper => !!p);
}

/** 이 논문 리뷰를 참고한(인용한) 후속 리뷰들 */
export async function getPapersCiting(paper: Paper): Promise<Paper[]> {
  const papers = await getPapers();
  return papers
    .filter((p) => p.data.references.includes(paper.id))
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

export function postUrl(id: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/insight/${id}/`;
}

export function paperUrl(id: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/papers/${id}/`;
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await getPublishedPosts();
  const papers = await getPapers();
  const counts = new Map<string, number>();
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
    .sort((a, b) => b.count - a.count);
}

export async function getSeries(): Promise<Map<string, CollectionEntry<'posts'>[]>> {
  const posts = await getPublishedPosts();
  const series = new Map<string, CollectionEntry<'posts'>[]>();
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
