## Jekyll to Astro: Complex Blog Migration Plan

<!-- Claude Code Session 261757c1-d0b1-48ef-8737-850892230997 (2025-07-13_20-25-19Z) -->

_**User**_

# Jekyll to Astro Migration Prompt

I need you to help me migrate my Jekyll blog to Astro + TypeScript + Cloudflare Pages. This is a complex migration with several custom components that need special handling.

## Project Context

- **Source**: Jekyll blog at `~/code/antgonzales.github.io` (GitHub Pages)
- **Target**: Current directory (Astro site already scaffolded)
- **Stack**: Astro + TypeScript + Cloudflare Pages
- **Constraint**: I want to do this entirely through prompts - no manual coding

## Key Migration Challenges

### 1. Custom Markdown Syntax

My Jekyll blog uses specific markdown extensions that need to be handled in Astro:

**Kramdown attribute syntax:**

- `{:target="_blank"}` - Link attributes (e.g., `[Product Engineer](https://leerob.com/n/product-engineers){:target="_blank"}`)
- `{:toc}` - Table of contents generation
- Other kramdown-style attributes applied to elements

**Content break syntax:**

- `<!--break-->` - Separates excerpt content (shown on index) from full content (shown only on individual post pages)

**Example usage:**

```markdown
This is my post excerpt that appears on the index page.

<!--break-->

This content only appears on the full post page, not in the excerpt.

Check out this [external link](https://example.com){:target="\_blank"} that opens in a new tab.

{:toc}
```

### 2. Feed.xml Route

- Current Jekyll generates `/feed.xml` for RSS
- Need equivalent RSS feed generation in Astro
- Should maintain same URL structure and XML format

### 3. Custom Jekyll/Ruby Tags

- `{{ site.time }}` - Current timestamp
- `{{ page.date | date: "%B %d, %Y" }}` - Date formatting
- `{{ content | excerpt }}` - Post excerpts
- `{{ page.tags | join: ", " }}` - Tag lists

## Migration Tasks

### Phase 1: Analysis & Setup

1. **Analyze Jekyll structure** at <https://github.com/antgonzales/antgonzales.github.io>
2. **Examine repository files**: \_config.yml, layouts, includes, posts, and custom components
3. **Review existing Astro setup** at the target location
4. **Plan migration strategy** based on both codebases
5. **Configure Cloudflare Pages** deployment settings

### Phase 2: Content Migration

1. **Convert Jekyll front matter** to Astro format
2. **Handle kramdown attribute syntax** (`{:target="_blank"}`, `{:toc}`)
3. **Process content breaks** (`<!--break-->`) for excerpt handling
4. **Migrate blog posts** maintaining URL structure and excerpt functionality
5. **Handle static assets** (images, CSS, etc.)

### Phase 3: Feature Recreation

1. **Recreate RSS feed** at `/feed.xml`
2. **Convert Jekyll templates** to Astro layouts
3. **Implement kramdown attribute equivalents** (link targets, TOC generation)
4. **Set up excerpt handling** based on `<!--break-->` markers
5. **Implement custom Ruby tag equivalents**
6. **Set up pagination** for blog posts

### Phase 4: Testing & Validation

Use Playwright MCP to:

1. **Visual regression testing** - Compare old vs new pages
2. **Content verification** - Ensure all posts migrated correctly
3. **RSS feed validation** - Check XML structure and content
4. **Performance testing** - Lighthouse scores
5. **Link checking** - Verify all internal/external links work

## Success Criteria

- [ ] All blog posts render identically to Jekyll version
- [ ] Kramdown attributes work (`:target="_blank"`, `:toc`, etc.)
- [ ] Content breaks (`<!--break-->`) properly separate excerpts
- [ ] RSS feed generates correctly at `/feed.xml`
- [ ] All Jekyll/Ruby tags have Astro equivalents
- [ ] Site builds and deploys to Cloudflare Pages
- [ ] Performance score >= 90 on Lighthouse
- [ ] No broken links or missing content

## My Approach

1. **Start with analysis** - I'll share my Jekyll files
2. **Iterate through prompts** - Each phase gets its own prompt
3. **Test continuously** - Use Playwright to verify each step
4. **Refine based on results** - Fix issues through prompt refinement

## First Step

Please start by thoroughly analyzing the Jekyll blog repository at:
**<https://github.com/antgonzales/antgonzales.github.io>**

Examine the complete repository structure, including:

- `_config.yml` configuration
- `_layouts/` and `_includes/` directories
- Sample blog posts in `_posts/`
- Any custom plugins or components
- Static assets and styling

Then create a detailed migration plan that accounts for my custom Markdown tags, RSS feed, and Jekyll/Ruby template tags. What patterns do you see that need special handling?

---

**Note**: I'll be documenting this entire process for a blog post about "vibe coding" - migrating a blog using only AI prompts. Your responses will help demonstrate effective prompt engineering for complex development tasks.


---

_**Agent (claude-sonnet-4-20250514)**_

I'll help you migrate your Jekyll blog to Astro. Let me start by analyzing your Jekyll repository and creating a comprehensive migration plan.

---

