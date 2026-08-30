// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";
import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import react from "@astrojs/react";
import rehypeExternalLinks from "rehype-external-links";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import replicaBone from "./src/themes/replica-bone.json" with { type: "json" };
import replicaCarbon from "./src/themes/replica-carbon.json" with { type: "json" };

// JSON imports widen literal strings; restore Shiki's discriminated theme type.
const replicaBoneTheme = {
  ...replicaBone,
  type: /** @type {"light"} */ ("light"),
};
const replicaCarbonTheme = {
  ...replicaCarbon,
  type: /** @type {"dark"} */ ("dark"),
};

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
      themes: { light: replicaBoneTheme, dark: replicaCarbonTheme },
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
