import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";

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
  // One appendable file, not one file per book. Keyed by slug, so the key is
  // the entry id — a re-read gets its own key (`the-road-2028`).
  // `finished` is month precision and absent means currently reading;
  // `note` is the slug of a written reflection, when one exists.
  loader: file("src/data/reading.json"),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    finished: z.coerce.date().optional(), // month precision; absent = currently reading
    note: z.string().optional(), // slug of a reflection, when written
  }),
});

export const collections = { posts, reading };
