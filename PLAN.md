# anthonygonzal.es — Astro Migration Plan

## Status

**Build complete. Deployed to staging.**

- Staging: https://anthonygonzal-es.pages.dev
- Production (Jekyll, still live): https://anthonygonzal.es
- Cutover is the only remaining step (manual, executed by you)

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
| ADR-8 | Cloudflare adapter | Removed | Adapter generates `wrangler.json` that breaks static Pages deploys |
| ADR-9 | Image service | `passthroughImageService` | Sharp blocked by pnpm `approve-builds`; no image transforms needed |
| ADR-10 | ThemeToggle | Plain Astro component (`is:inline`) | React island caused hydration flicker; `is:inline` runs synchronously |
| ADR-11 | prose scope | `prose` on `<main>` | Consistent typography site-wide; use `not-prose` to opt out |
| ADR-12 | Footer | Removed | Email on homepage; RSS autodiscovery in `<head>` |
| ADR-13 | About page | Removed | Content merged into homepage; `/about/` → `/` redirect in `_redirects` |
| ADR-14 | Nav label for /blog/ | "Archive" | Chronological post list is an archive, not a blog index |

---

## Stack (actual)

- Astro 6, `output: 'static'`, no adapter
- `@astrojs/react`, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`
- Tailwind CSS v4 + `@tailwindcss/typography`
- TypeScript strict (`astro/tsconfigs/strict`)
- Dark mode: `.dark` class on `<html>`, CSS custom properties, no-flash inline `<script>` in `<head>`, `ThemeToggle.astro` with `is:inline`
- `passthroughImageService` (no Sharp)
- pnpm 10.18.3, Node 22 (`.node-version`)
- Vitest + jsdom, 20 tests

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

## Visual Identity

### Color tokens (CSS custom properties)

| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-bg` | `#fff` | `#111` | Page background |
| `--color-text` | `#222` | `#e8e8e8` | Body text |
| `--color-link` | `#76a7d8` | `#76a7d8` | Links |
| `--color-nav` | `#A52A2A` | `#c44` | Nav logo (ox-blood) |
| `--color-meta` | `#777` | `#888` | Post meta, section labels |
| `--color-border` | `#DDD` | `#333` | Borders, HR |
| `--color-code-bg` | `#f6f8fa` | `#1e1e1e` | Code block background |

### Typography

- Body: `system-ui, sans-serif`, `1.125rem` (18px), line-height `1.6`
- Code/mono: `ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace`
- Heading weight: `400`
- Max content width: `max-w-3xl` (Tailwind)
- Tailwind dark variant: `@variant dark (&:where(.dark, .dark *))`

---

## File Structure

```
src/
├── assets/img/                   # Hero images (Astro-processed at build)
│   ├── compass-one.webp
│   ├── glass-house-at-night-compressed.jpg
│   └── post-boxes-on-brick-compressed.jpg
├── components/
│   └── ThemeToggle.astro         # is:inline script, no flicker
├── content/
│   └── posts/                    # 12 .md posts (fully audited)
├── content.config.ts
├── layouts/
│   ├── BaseLayout.astro          # HTML shell, no footer, Archive nav link
│   └── PostLayout.astro          # Post header + prose wrapper
├── lib/
│   ├── formatDate.ts             # UTC-safe date formatter
│   ├── getExcerpt.ts             # First paragraph extractor
│   ├── getExcerpt.test.ts        # 10 tests
│   ├── themeToggle.ts            # Toggle logic (testable)
│   └── themeToggle.test.ts       # 10 tests
├── pages/
│   ├── index.astro               # Bio + Latest post + Previous posts
│   ├── rss.xml.ts
│   └── blog/
│       ├── index.astro           # Archive: full post list (title + date)
│       └── [...slug].astro       # Post detail
└── styles/
    └── global.css                # @theme tokens, @layer base, prose on <main>
public/
├── _redirects                    # 14 redirects (.html → clean URL, /about/ → /)
├── favicon.svg
└── assets/img/
    ├── compass-one/              # 6 body images
    └── compass-one-launch/       # 8 body images
```

---

## Redirect Map (`public/_redirects`)

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
/blog/dont-mock-in-jest.html                              /blog/how-to-test-react-router-components/     301
/about/                                                   /                                              301
```

---

## Phase Plan

| Phase | Action | Status |
|---|---|---|
| 1 | Write `PLAN.md` | Done |
| 2 | Repo reset | Done |
| 3 | Install integrations + configure `astro.config.mjs` | Done |
| 4 | Scaffold file structure | Done |
| 5 | BaseLayout + dark mode + ThemeToggle | Done |
| 6 | Content config + all pages + RSS | Done |
| 7 | Pilot post: `how-to-test-react-router-components` | Done |
| 8 | Bulk port remaining 11 posts (all audited + content restored) | Done |
| 9 | Cutover (manual — you execute) | Pending |

---

## Cutover Checklist (execute when ready)

1. Verify https://anthonygonzal-es.pages.dev looks correct end-to-end
2. Spot-check a few `.html` redirects (e.g. `/blog/hello-world.html` → `/blog/hello-world/`)
3. Cloudflare Pages → `antgonzales-github-io` project → Custom domains → remove `anthonygonzal.es`
4. Cloudflare Pages → `anthonygonzal-es` project → Custom domains → add `anthonygonzal.es`
5. SSL auto-provisions; DNS propagates (usually < 5 min on Cloudflare DNS)
6. Verify `https://anthonygonzal.es` serves the new Astro site
7. Submit updated sitemap to Google Search Console (`https://anthonygonzal.es/sitemap-index.xml`)
