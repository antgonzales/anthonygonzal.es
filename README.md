# Anthony Gonzales — Blog & Portfolio

This site is built with [Astro](https://astro.build), a modern static site generator. It powers my personal blog and portfolio at [anthonygonzale.es](https://anthonygonzale.es).

## ✍️ Writing & Publishing Blog Posts

- Blog posts are written in Markdown (`.md`) and live in `src/pages/blog/`.
- To create a new post, add a file like `my-new-post.md` to that folder.
- Use [frontmatter](https://docs.astro.build/en/guides/markdown-content/#frontmatter) for metadata (title, date, description, etc.).
- **Hero image:** To display a hero image on the homepage, place a Markdown image as the very first line after the frontmatter in your latest post. The homepage will automatically show this image above the excerpt.

**Example post:**

```markdown
---
layout: ../../layouts/BlogPost.astro
title: "My New Post"
description: "A quick guide to writing posts in Astro."
date: 2025-07-05
---

![A beautiful sunrise over the mountains](/assets/img/hero-sunrise.jpg)

Your content goes here!
```

- The image path should point to a file in `public/assets/img/`.
- The homepage always uses the first image in the latest post as its hero image.

## 🎨 Using SASS for Styling

- This project uses SASS/SCSS for styling. All main styles are located in `src/styles/`.
- The entry point is `src/styles/index.scss`, which forwards all partials (e.g., `_variables.scss`, `_base.scss`, etc.).
- To add or update styles, edit or add partials in `src/styles/` and import them in `index.scss`.
- SASS is compiled automatically as part of the Astro build process—no manual compilation needed.

**Example structure:**
```
src/styles/
  ├── _variables.scss
  ├── _base.scss
  ├── _utilities.scss
  ├── _typography.scss
  ├── _style.scss
  ├── _header.scss
  ├── _footer.scss
  ├── _home.scss
  ├── _blog.scss
  ├── _post.scss
  ├── _page.scss
  ├── _resume.scss
  ├── _about.scss
  └── index.scss
```

- You can use all SASS features (variables, nesting, mixins, etc.) in your partials.

## 🛠️ Project Structure

```
/
├── public/           # Static assets (images, favicon, etc.)
├── src/
│   ├── components/   # Reusable UI components
│   ├── layouts/      # Page layouts
│   ├── pages/        # Pages and blog posts
│   └── styles/       # SASS/SCSS styles
├── package.json
└── astro.config.mjs
```

- Pages in `src/pages/` become routes (e.g., `about.astro` → `/about`).
- Components and layouts help you build custom UIs.

## 🚀 Local Development

```sh
npm install
npm run dev
```
Visit [localhost:4321](http://localhost:4321) to preview your site.

## 🏗️ Building & Deploying

```sh
npm run build
```
The static site is output to `dist/`. Deploy this folder to your preferred host.

## 📚 More Resources

- [Astro Documentation](https://docs.astro.build)
- [Astro Discord](https://astro.build/chat)
