// @ts-check
import {
  defineConfig,
  passthroughImageService,
  fontProviders,
} from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
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
      name: "Lora",
      cssVariable: "--font-lora",
      weights: [400],
      styles: ["normal", "italic"],
      display: "optional",
    },
  ],
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
