import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().max(320),
    permalink: z.string(),
    order: z.number().nonnegative(),
    publishedAt: z.string(),
    readingTime: z.number().min(1),
    heroImage: z.string().nullable(),
    sourceUrl: z.string().url(),
  }),
});

export const collections = { posts };

