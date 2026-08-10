// @ts-check
import {
  defineConfig,
  passthroughImageService,
  fontProviders,
} from "astro/config";
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
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Inter",
      cssVariable: "--font-geist",
      weights: [400, 500, 700],
      styles: ["normal", "italic"],
      display: "optional",
    },
    {
      provider: fontProviders.fontsource(),
      name: "JetBrains Mono",
      cssVariable: "--font-geist-mono",
      weights: [400],
      styles: ["normal"],
      display: "optional",
    },
  ],
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        { rel: ["noopener"], target: "_blank" },
      ],
    ],
  },
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
