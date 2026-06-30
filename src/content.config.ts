import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    series: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    description: z.string().optional(),
    tldr: z.array(z.string()).optional(),
    prerequisites: z.array(z.string()).optional(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    source: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { posts, notes };
