# anthonygonzal.es — Astro Migration Plan

## Status

In progress. Live production site remains at `antgonzales-github-io` (Jekyll)
until final cutover. Staging: https://anthonygonzal-es.pages.dev

---

## ADR Log

| # | Decision | Choice | Rationale |
|---|---|---|---|
| ADR-1 | Astro output mode | `output: 'static'` | No SSR needed; CDN-served files, zero cold starts |
| ADR-2 | Permalink format | Clean URLs `/blog/slug/` | Modern standard; better shareability |
| ADR-3 | .html redirect handling | `_redirects` for all 12 old URLs | Preserves SEO, no broken inbound links |
| ADR-4 | `redirect_from` legacy paths | Drop them | Low traffic risk; simplifies config |
| ADR-5 | Draft support | Not in initial schema | Port only 12 published posts; add later if needed |
| ADR-6 | `heroImage` type | Astro `image()` helper | Build-time optimization; images in `src/assets/` |
| ADR-7 | Pilot post | `how-to-test-react-router-components` | Most complete front matter; has `last_modified_at` |

---

## Target Stack

- Astro 5, `output: 'static'`, `@astrojs/cloudflare` adapter
- `@astrojs/react`, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`
- Tailwind CSS v4 + `@tailwindcss/typography`
- TypeScript strict (extends `astro/tsconfigs/strict`)
- Dark mode: `.dark` class on `<html>`, CSS custom properties, no-flash inline script, `<ThemeToggle client:load />`

---

## Content Collection Schema

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      tags: z.array(z.string()).default([]),
    }),
});

export const collections = { posts };
```

---

## Jekyll → Astro Field Mapping

| Jekyll | Astro | Notes |
|---|---|---|
| `title` | `title` | Direct port |
| `date` | `pubDate` | Renamed; `z.coerce.date()` for flexibility |
| `description` | `description` | Optional (2 older posts lack it) |
| `last_modified_at` | `updatedDate` | Renamed |
| `image` | `heroImage` | Astro `image()` type; move files to `src/assets/img/` |
| `categories` | `tags` | Generalized; default `[]` |
| `layout` | — | Dropped (Astro file-based layouts) |
| `redirect_from` | — | Dropped (handled by `_redirects`) |

---

## Visual Identity (ported from Jekyll)

### Colors (CSS custom properties)

| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-bg` | `#fff` | `#111` | Page background |
| `--color-text` | `#222` | `#e8e8e8` | Body text (`--ink`) |
| `--color-link` | `#76a7d8` | `#76a7d8` | Links (`--sky-blue`) |
| `--color-nav` | `#A52A2A` | `#c44` | Nav logo (`--ox-blood`) |
| `--color-meta` | `#777` | `#888` | Post meta, section labels (`--gray`) |
| `--color-border` | `#DDD` | `#333` | Borders, HR (`--gray-light`) |
| `--color-code-bg` | `#f6f8fa` | `#1e1e1e` | Code block background |

### Typography

- Body: `system-ui, sans-serif`
- Code/meta: `ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace`
- Base font size: `62.5%` on `html` (so `1rem = 10px`), body at `2rem` (~20px)
- Line height: `1.6`
- Heading weight: `400` (not bold)
- Max content width: `76.8rem`

### Layout

- CSS Grid: `grid-template-rows: auto 1fr auto` (`nav / main / footer`)
- Nav logo: letter-by-letter flex layout, `justify-content: space-between`
- `min-height: 100vh`

---

## File Structure

```
src/
├── assets/
│   └── img/                  # Hero images (Astro-processed at build time)
├── components/
│   └── ThemeToggle.tsx        # React island
├── content/
│   └── posts/                 # .md and .mdx post files
├── content.config.ts
├── layouts/
│   ├── BaseLayout.astro       # HTML shell, theme script, nav, footer
│   └── PostLayout.astro       # Post header (title, dates), prose wrapper
└── pages/
    ├── index.astro            # Homepage: latest post excerpt + 5 recent
    ├── about.astro
    ├── rss.xml.ts
    └── blog/
        ├── index.astro        # Full post listing (title + date)
        └── [...slug].astro    # Post detail page
public/
└── _redirects                 # 301s from all old Jekyll .html URLs
```

---

## Permalink Strategy

New URLs use clean trailing-slash format: `/blog/slug/`

`public/_redirects` provides 301 redirects for all 12 old Jekyll URLs:

```
/blog/hello-world.html                                    /blog/hello-world/                             301
/blog/setup-eslint-prettier-with-typescript.html          /blog/setup-eslint-prettier-with-typescript/   301
/blog/joy-of-tidying-with-nps.html                        /blog/joy-of-tidying-with-nps/                 301
/blog/why-learn-test-driven-development.html              /blog/why-learn-test-driven-development/       301
/blog/how-to-test-data-fetching-components.html           /blog/how-to-test-data-fetching-components/    301
/blog/how-to-improve-git-monorepo-performance.html        /blog/how-to-improve-git-monorepo-performance/ 301
/blog/how-to-solve-match-media-is-not-a-function.html     /blog/how-to-solve-match-media-is-not-a-function/ 301
/blog/how-to-test-react-router-components.html            /blog/how-to-test-react-router-components/     301
/blog/introducing-compass-one.html                        /blog/introducing-compass-one/                 301
/blog/building-a-transaction-dashboard-on-compass.html    /blog/building-a-transaction-dashboard-on-compass/ 301
/blog/compass-one-inman-awards.html                       /blog/compass-one-inman-awards/                301
/blog/promoted-to-staff-engineer.html                     /blog/promoted-to-staff-engineer/              301
```

---

## Dark Mode Implementation

1. **No-flash script** — inline `<script>` in `<head>` before first paint:
   - Reads `localStorage.theme`
   - Falls back to `prefers-color-scheme: dark`
   - Sets `.dark` class on `<html>` synchronously
2. **CSS tokens** — all color values as CSS custom properties on `:root` (light) and `.dark` (dark)
3. **ThemeToggle.tsx** — React island (`client:load`):
   - Reads current theme from `document.documentElement.classList`
   - Toggles `.dark` class and writes to `localStorage`
   - Renders a sun/moon icon button

---

## Phase Plan

| Phase | Action | Status |
|---|---|---|
| 1 | Write `PLAN.md` | Done |
| 2 | Repo reset (single wipe commit on `main`) | Pending confirmation |
| 3 | Install integrations + configure `astro.config.mjs` | Pending |
| 4 | Scaffold file structure | Pending |
| 5 | BaseLayout + dark mode + ThemeToggle | Pending |
| 6 | Content config + all pages + RSS | Pending |
| 7 | Pilot post: `how-to-test-react-router-components` | Pending |
| 8 | Bulk port remaining 11 posts | Pending |
| 9 | Cutover (manual — you execute) | Pending |

---

## Cutover Checklist (execute when new site is ready)

1. Verify `https://anthonygonzal-es.pages.dev` looks correct end-to-end
2. Spot-check a few `.html` redirects (e.g. `/blog/hello-world.html` → `/blog/hello-world/`)
3. Cloudflare Pages → `antgonzales-github-io` project → Custom domains → remove `anthonygonzal.es`
4. Cloudflare Pages → `anthonygonzal-es` project → Custom domains → add `anthonygonzal.es`
5. SSL auto-provisions; DNS propagates (usually < 5 min on Cloudflare DNS)
6. Verify `https://anthonygonzal.es` serves the new Astro site
7. Submit updated sitemap to Google Search Console (`https://anthonygonzal.es/sitemap-index.xml`)
