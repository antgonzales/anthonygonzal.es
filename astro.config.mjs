// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.anthonygonzales.dev',
  adapter: cloudflare(),
  markdown: {
    shikiConfig: {
      themes: {
        light: 'rose-pine-dawn',
        dark: 'rose-pine-moon'
      },
      defaultColor: false
    },
    remarkPlugins: [
      remarkGfm
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: 'append',
        properties: {
          className: ['post-header-link'],
          ariaLabel: 'Link to this heading'
        }
      }],
      [rehypeExternalLinks, {
        target: '_blank',
        rel: ['noopener', 'noreferrer']
      }]
    ]
  }
});