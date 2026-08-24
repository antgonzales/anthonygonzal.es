// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import rehypeExternalLinks from "rehype-external-links";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import inkPaper from "./src/themes/ink-paper.json" with { type: "json" };
import ink from "./src/themes/ink.json" with { type: "json" };

// JSON imports widen literal strings; restore Shiki's discriminated theme type.
const inkPaperTheme = {
  ...inkPaper,
  type: /** @type {"light"} */ ("light"),
};
const inkTheme = { ...ink, type: /** @type {"dark"} */ ("dark") };

export default defineConfig({
  site: "https://anthonygonzal.es",
  output: "static",
  trailingSlash: "always",
  redirects: {
    "/about": "/",
  },
  image: {
    service: passthroughImageService(),
  },
  markdown: {
    shikiConfig: {
      themes: { light: inkPaperTheme, dark: inkTheme },
    },
    rehypePlugins: [
      [rehypeExternalLinks, { rel: ["noopener"], target: "_blank" }],
    ],
  },
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
