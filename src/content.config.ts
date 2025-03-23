import { defineCollection, z } from 'astro:content';
import { glob, } from 'astro/loaders'; // Not available with legacy API

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/pages/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    last_modified_at: z.date().optional(),
    excerpt: z.string().optional(),
  }),
});

export const collections = { blog };
