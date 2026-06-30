import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts, getPapers } from '../utils/posts';
import { SITE } from '../config';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  const papers = await getPapers();

  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description ?? '',
      link: `/insight/${post.id}/`,
      categories: post.data.tags,
    })),
    ...papers.map((paper) => ({
      title: `[논문] ${paper.data.title}`,
      pubDate: paper.data.date,
      description: paper.data.description ?? '',
      link: `/papers/${paper.id}/`,
      categories: paper.data.tags,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items,
    customData: `<language>ko</language>`,
  });
}
