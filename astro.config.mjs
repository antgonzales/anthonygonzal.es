// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";
import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import react from "@astrojs/react";
import rehypeExternalLinks from "rehype-external-links";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
// Both Shiki themes are derived from src/data/replica.json; see /replica/.
import { replicaBone, replicaCarbon } from "./src/lib/replica.ts";

export default defineConfig({
  site: "https://anthonygonzal.es",
  output: "static",
  trailingSlash: "always",
  redirects: {
    "/about": "/",
    "/blog/recreating-vera-molnar-desordres":
      "/blog/vera-molnar-desordres-study",
  },
  image: {
    service: passthroughImageService(),
  },
  markdown: {
    shikiConfig: {
      themes: { light: replicaBone, dark: replicaCarbon },
    },
    processor: unified({
      rehypePlugins: [
        [
          rehypeExternalLinks,
          { rel: ["nofollow", "noopener"], target: "_blank" },
        ],
      ],
    }),
  },
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
