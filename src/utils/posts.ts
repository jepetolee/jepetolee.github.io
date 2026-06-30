import { getCollection, type CollectionEntry } from 'astro:content';

export async function getPublishedPosts(): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getNotes(): Promise<CollectionEntry<'notes'>[]> {
  const notes = await getCollection('notes');
  return notes.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
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

export function noteUrl(id: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/notes/${id}/`;
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await getPublishedPosts();
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
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
