# AGENTS.md

This file is for agents working in this repository: what it is, how it is laid out, and the rules for changing it.

## What this is

The website for [TUIOS](https://github.com/Gaurav-Gosain/tuios), a terminal multiplexer written in Go. It is served at https://tuios.dev and has three parts:

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
  brand/                      brand page, and the kit zip built from public/brand (lib/brand.ts lists the files)
  docs/[[...slug]]/           docs pages
  blog/                       blog index and blog/[slug] posts
  releases/                   releases index and releases/[slug] pages
  og/docs/[...slug]/          Open Graph images for docs pages (all cards are drawn by lib/og.tsx)
  og/blog/[...slug]/          Open Graph images for posts
  og/releases/[...slug]/      Open Graph images for releases
  api/search/                 static search index (staticGET)
  llms.txt/                   index of every page for language models
  llms-full.txt/              every docs page as one text file
  sitemap.ts, robots.ts       sitemap.xml and robots.txt, built from the content
  blog/rss.xml, blog/atom.xml           blog feeds, full text
  releases/rss.xml, releases/atom.xml   release note feeds, full text
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
  site.ts                     site URL, name, description, feed paths
  metadata.ts                 pageMetadata: canonical, feed links, OG and Twitter cards
  feed.ts, feeds.ts           RSS and Atom rendering, markdown to HTML for feeds
  layout.shared.tsx           nav title and top links (Docs, Blog, Releases)
public/                       favicons, web manifest, demo.gif, fonts, CNAME, _headers
public/brand/                 the logo: Tilly mark, wordmark and lockups (SVG and PNG)
assets/                       build-time only: the Fredoka font and the pieces of the OG card
components/brand.tsx          the header and footer logo (mark and outlined wordmark)
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

`.github/workflows/deploy.yml` runs the tests, builds the /learn engine and the site on every push to `main`, then deploys the Worker in `worker/` with `wrangler deploy`. The Worker serves `out/` from Workers static assets.

The site lives at `https://tuios.dev`, set once in `lib/site.ts` (`site.url`), which metadata, canonical URLs, the sitemap, robots.txt, the feeds, JSON-LD and llms.txt all read. The OG images and the /learn share text print the bare host, so they name it as a literal.

The Worker is attached to three custom domains in `worker/wrangler.jsonc`. `tuios.dev` serves the site. `www.tuios.dev` and `tuios.gaurav.zip` (the site's first address) answer every request with a permanent 301 to the same path and query on `https://tuios.dev`, with no exceptions. That redirect is in `worker/redirect.ts` and must stay permanent: old links, feed subscriptions and search results depend on it.

## Learn page

`/learn` runs the real tuios in the browser: tuios compiled to WebAssembly with a pretend shell, drawn by sip's WebTerm. The pieces:

- `components/learn/`: the hub (live hero and track cards), the lesson screen, the finish panel with the share card, and the phone preview.
- `lib/learn/`: `runtime.ts` loads and boots the wasm, `engine.ts` runs a track from tuios's event stream, `matchers.ts` has the step checks, and `tracks/` holds one file per track. Add a track by writing a file there and listing it in `tracks/index.ts`. `bun test lib/` checks the engine and every track.
- The engine files are not in git. `bun scripts/learn-engine.mjs <dir>` copies a tuios browser build (what `cmd/tuios-wasm/build.sh` in tuios writes) into `public/learn/engine/<hash>/` and writes `public/learn/engine.json`. Without them the page shows that the engine is missing and everything else still builds.
- Deploy builds tuios at the commit in `learn/TUIOS_REF`. Bump that file to teach a newer tuios.
- Only a gzipped wasm ships, because the raw file is over the 25 MiB asset limit. The page unpacks it with `DecompressionStream`, so it needs no special headers on any host.

## Notes

1. **Static export**: there is no server at runtime. Route handlers must be static (search uses `staticGET`, and every route sets `revalidate = false`).
2. **Generated files**: do not edit `.source/`. `fumadocs-mdx` regenerates it.
3. **Search engines**: `app/sitemap.ts` lists every docs page, post and release note, so a new page needs no sitemap edit. Every page's metadata goes through `pageMetadata` in `lib/metadata.ts`, which sets the canonical URL and the feed links; Next.js replaces `alternates` as a whole, so a page that builds its own metadata loses the feed links. Docs, posts and release notes also emit JSON-LD (`components/json-ld.tsx`). A docs page's frontmatter `description` is its meta description, so keep it a real sentence.
4. **Headers**: `public/_headers` sets a Content-Security-Policy. An external script, font or image host must be allowed there.
