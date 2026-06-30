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

const papers = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/papers' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    // 카테고리 세부항목화: 대분류 + 소분류
    category: z.string(),
    subcategory: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // 원 논문 정보
    paper: z.string().optional(),
    paperUrl: z.string().url().optional(),
    authors: z.string().optional(),
    venue: z.string().optional(),
    year: z.number().optional(),
    // reference 순서 연결: 이 리뷰가 토대로 삼은 선행 논문 리뷰들의 id (읽는 순서대로)
    references: z.array(z.string()).default([]),
    description: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, papers };
