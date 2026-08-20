// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import rehypeExternalLinks from "rehype-external-links";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://anthonygonzal.es",
  output: "static",
  trailingSlash: "always",
  image: {
    service: passthroughImageService(),
  },
  markdown: {
    // v4 code blocks are hairline-bordered paper panels — no ink blocks and
    // no accent color, so Shiki's themed output is off.
    syntaxHighlight: false,
    rehypePlugins: [
      [rehypeExternalLinks, { rel: ["noopener"], target: "_blank" }],
    ],
  },
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
