# AGENTS.md

This file is for agents working in this repository: what it is, how it is laid out, and the rules for changing it.

## What this is

The website for [TUIOS](https://github.com/Gaurav-Gosain/tuios), a terminal multiplexer written in Go. It is served at https://tuios.gaurav.zip and has three parts:

- **Docs** (`/docs`): the user reference.
- **Blog** (`/blog`): long engineering posts.
- **Releases** (`/releases`): one page per release, plus a running page for unreleased work.

Stack: Next.js 16 (App Router, static export), Fumadocs 16 (`fumadocs-core`, `fumadocs-ui`, `fumadocs-mdx`), React 19, TypeScript, Tailwind CSS v4, Biome, Bun.

## Commands

```bash
bun install          # also runs fumadocs-mdx to generate .source/
bun run dev          # dev server on port 3000
bun run build        # static export to out/
bun run types:check  # fumadocs-mdx, then tsc --noEmit
bun run lint         # biome check
bun run format       # biome format --write
```

Run `types:check`, `lint` and `build` before you commit. The build must succeed: it is what deploys.

## Layout

```
app/
  layout.tsx                  root layout
  global.css                  Tailwind, Fumadocs theme, Monaspace Neon font
  (home)/                     landing page
  docs/[[...slug]]/           docs pages
  blog/                       blog index and blog/[slug] posts
  releases/                   releases index and releases/[slug] pages
  og/docs/[...slug]/          Open Graph images for docs pages
  og/blog/[...slug]/          Open Graph images for posts
  og/releases/[...slug]/      Open Graph images for releases
  api/search/                 static search index (staticGET)
  llms-full.txt/              every docs page as one text file
components/
  layout/                     customized Fumadocs docs layout and sidebar
  toc/                        table of contents
  ui/                         small Radix-based primitives
  mdx/                        interactive MDX widgets, one file each
content/
  docs/                       docs pages (.mdx); meta.json sets sidebar order
  blog/                       posts (.mdx)
  releases/                   release pages (.mdx)
lib/
  source.ts                   Fumadocs loaders for the three collections,
                              date sorting, OG image paths, llms text
  layout.shared.tsx           nav title and top links (Docs, Blog, Releases)
public/                       icon, demo.gif, fonts, CNAME, _headers, robots.txt, sitemap.xml
mdx-components.tsx            registers the MDX widgets
source.config.ts              the docs, blog and releases collections
next.config.mjs               output: 'export'
```

## Content

### Docs

Each page in `content/docs/` needs `title` and `description` in its frontmatter. `icon` is a lucide-react icon name (use `House`, not `Home`). A new page must be added to `content/docs/meta.json` or it will not appear in the sidebar.

### Blog and releases

Posts in `content/blog/` and pages in `content/releases/` need `title`, `description`, `date` and `author`. `date` is a plain `YYYY-MM-DD` string, and the index pages sort by it, newest first. The file name is the URL slug. `content/blog/meta.json` is not used for ordering.

### MDX widgets

The widgets in `components/mdx/` are client components used in docs, posts and release notes, for example `<TerminalCapture>`, `<BenchBars>` and `<TapeTrustFlow>`. A widget registered in `mdx-components.tsx` can be used in any page without an import, so a new widget needs both its file and a line there. Mermaid diagrams are written as fenced `mermaid` code blocks and rendered by a remark plugin.

A widget that shows TUIOS behavior should match the code. Check it against the tuios source before you use it in the docs.

## Writing rules

- Plain, direct technical English. Short sentences. Say what a thing does and how to use it.
- No em dashes and no double hyphens as dashes. Use a period, comma, colon or parentheses.
- No emojis.
- Check every command, flag, default and sample output against the tuios source or a built binary. The tuios repository's `docs/` and `skills/tuios/SKILL.md` are good references.
- Keep MDX components and their props intact, and keep the frontmatter valid.

## Deployment

`.github/workflows/deploy.yml` runs `bun install` and `bun run build` on every push to `main`, then publishes `out/` to GitHub Pages at `tuios.gaurav.zip`.

## Notes

1. **Static export**: there is no server at runtime. Route handlers must be static (search uses `staticGET`, and every route sets `revalidate = false`).
2. **Generated files**: do not edit `.source/`. `fumadocs-mdx` regenerates it.
3. **Sitemap**: `public/sitemap.xml` is written by hand and lists only a few early pages. It is not generated from the content.
4. **Headers**: `public/_headers` sets a Content-Security-Policy. An external script, font or image host must be allowed there.
