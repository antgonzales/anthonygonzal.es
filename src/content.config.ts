import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";
import { parseReadingYaml } from "./lib/parseReadingYaml";

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
  // One appendable file, not one file per book. Ids are derived from titles
  // by the parser so the yaml itself stays three lines per entry.
  loader: file("src/data/reading.yaml", { parser: parseReadingYaml }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    finished: z.coerce.date().optional(), // month precision; absent = currently reading
    note: z.string().optional(), // slug of a reflection, when written
  }),
});

export const collections = { posts, reading };
