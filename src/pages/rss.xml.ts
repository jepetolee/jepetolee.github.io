import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '../utils/posts';
import { SITE } from '../config';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description ?? '',
      link: `/insight/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: `<language>ko</language>`,
  });
}
