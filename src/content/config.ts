import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    last_modified_at: z.coerce.date().optional(),
    layout: z.string().optional().default('post'),
    redirect_from: z.array(z.string()).optional(),
    draft: z.boolean().optional().default(false),
    archived: z.boolean().optional().default(false),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  blog,
};