import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Doubles as the entry dek across every listing. */
      description: z.string().optional(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
    }),
});

const reading = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/reading" }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    started: z.coerce.date(),
    finished: z.coerce.date().optional(),
    note: z.string().optional(), // slug of a reflection, when written
  }),
});

export const collections = { posts, reading };
