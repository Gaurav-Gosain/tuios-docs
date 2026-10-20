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
  api/search.json/            static search index (staticGET), served as JSON so it is compressed
  llms.txt/                   index of every page for language models
  llms-full.txt/              every docs page as one text file
  sitemap.ts, robots.ts       sitemap.xml and robots.txt, built from the content
  blog/rss.xml, blog/atom.xml           blog feeds, full text
  releases/rss.xml, releases/atom.xml   release note feeds, full text
components/
  layout/                     customized Fumadocs docs layout and sidebar
  toc/                        table of contents
  ui/                         small Radix-based primitives
  mdx/                        interactive MDX widgets for posts and release notes, one file each
  docs/                       interactive widgets for the docs pages (layout modes, keybinding
                              explorer, session diagram, Inbox demo, review walkthrough)
  home/                       landing page pieces: install tabs and the screenshot showcase
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
public/                       favicons, web manifest, fonts, CNAME, _headers, _redirects
public/shots/                 whole-screen captures of tuios for the landing page and docs, 1600
                              and 800 wide WebP (see "Screenshots" below)
public/clips/                 short silent clips of tuios for the docs: AV1 WebM, H.264 MP4 and a
                              WebP poster each, made by scripts/docs-media.sh
media/                        the scenes and tools behind public/clips and the newer public/shots
lib/keybindings/defaults.json the default bindings behind the keybinding explorer, written by
                              scripts/keybindings.mjs from `tuios keybinds doctor --json`
lib/since/data.json           the first tuios tag of each config key, command, action and verb,
                              written by scripts/since.mjs (see "Version badges")
public/brand/                 the logo: Tilly mark, wordmark and lockups (SVG and PNG)
assets/                       build-time only: the Fredoka font and the pieces of the OG card
components/brand.tsx          the header and footer logo (mark and outlined wordmark)
components/tilly-3d/          the 3D Tilly: scene.ts (three.js, loaded with a dynamic import) and the
                              hero and /brand viewer components, with the 2D figure as placeholder and fallback
lib/tilly-3d/                 the 3D Tilly's face drawing and motion math, tested by bun test lib/
lib/sketch/                   the sketch playground: the Web Worker that runs tuios.dev/sketch as wasm,
                              the morph between two drawings, the examples and the share link.
                              scripts/sketch-engine.mjs copies the wasm built at sketch-playground/TUIOS_REF
                              tests/sketch/xss.mjs drives the page with hostile share links; run it before
                              changing lib/sketch/sanitize.ts or the engine pin
assets/tilly-3d/              tilly.py (Blender) and build.sh, which rebuild public/tilly/tilly.glb
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

### Screenshots and generated data

Pictures of tuios come from tuios's own renderer, never from a screen grab of a terminal. `public/shots/` holds whole-screen captures made with the `screenshot_screen` action (PNG at scale 2, frame `none`, theme `catppuccin_mocha`) from a client attached to a demo session in an isolated `HOME` and `XDG_RUNTIME_DIR`, then resized to WebP with `cwebp`. Look at each one at full size before you commit it: no personal paths, prompts or leftover notifications.

`scripts/docs-media.sh` makes the newer shots and every clip from tuios tapes. Each scene is a folder in `media/scenes/` with a `scene.json` and a `scene.tape`. The script runs the tape against a real tuios and its own daemon in a throwaway `HOME`. A shot comes from the `screenshot_screen` action. A clip comes from the client's own output, drawn at 60 fps by xterm.js in headless Chromium, so a busy machine cannot drop a frame. When the UI changes, run the script again. `<Shot>` and `<DocsClip>` put the results on a page. Keep each clip under 1.5 MB, and keep it silent.

`scripts/gen-library-shots.sh` makes the pictures of the library pages (`content/docs/libraries/`) with `tools/libshots`, a Go program that draws each one with the library it shows and renders it with shot. Each picture is drawn in the dark and the light theme of the site, as `public/libs/LIB/NAME.webp` and `NAME-light.webp`, and its size goes into `lib/libshots.json`. `<LibShot name="LIB/NAME">` puts one on a page. The TML sources are in `tools/libshots/scenes/`, and the code a page shows next to a picture is in `tools/libshots/snippets/`, cut from the program that drew it. A page includes both with `<include cwd>`, so the code and the picture cannot drift apart. After a library changes, move the pins in `tools/libshots/go.mod` and run the script again.

The keybinding explorer reads `lib/keybindings/defaults.json`. Regenerate it after tuios changes its defaults; the header of `scripts/keybindings.mjs` has the commands, one report per platform because macOS binds `opt+` where the others bind `alt+`.

### Version badges

`<Since />` marks the tuios version that added a feature. Name the thing it labels, and the version comes from `lib/since/data.json`:

```mdx
| `link_hover` <Since config="appearance.link_hover" /> | ... |
### pair <Since command="pair" /> [#pair]
| <kbd>H</kbd> | `prefix_toggle_other_rail` <Since action="prefix_toggle_other_rail" /> | ... |
<Since verb="stream-pane" />
<Since feature="mail-seen" />
```

- A feature on tuios main and in no release yet reads "Unreleased". After the release it reads "Added in vX.Y.Z", with no edit to the page.
- A version older than `badgeFloor` in `lib/since.ts` (v0.8.0) shows no badge, so old keys do not fill every table with badges.
- For a feature no config key, command, action or verb names, add an entry to `lib/since/features.json` with a `probe`: a string the tuios source has only once the feature is there.
- A heading with a badge needs an explicit id, `[#slug]`, or its anchor ends in a dash.
- `bun test lib/` fails on a badge that names nothing, or names a key tuios does not have.

`scripts/since.mjs` writes `lib/since/data.json` from a tuios checkout with its tags. It also builds tuios to read the command tree, unless `--bin` names a binary built from the same commit:

```bash
bun scripts/since.mjs ../tuios                 # items from origin/main
bun scripts/since.mjs ../tuios --ref HEAD --bin /tmp/tuios
```

`/docs/versions` lists every item by version, from the same file.

### A tuios release

When tuios tags a release:

1. Run the **Since** workflow (`.github/workflows/since.yml`) by hand, or wait for its daily run. It runs `scripts/since.mjs` against tuios main and opens a pull request when a version changed. Every item the new tag holds moves from "Unreleased" to that version.
2. The pull request starts no checks by itself. Push to it, or close and reopen it, then merge it once Check passes.
3. Add the release notes page in `content/releases/`. `/docs/versions` links each version to its notes when the page exists.

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

The Go libraries of tuios have import paths on this site, such as `tuios.dev/progstatus`. `worker/goimport.ts` answers `/<name>?go-get=1`, and any path below it, with the `go-import` meta tag. The tag names the library's folder in the tuios repository, a form the go command reads from Go 1.25 on. Other requests to those paths get a 302 to `/docs/libraries/<name>`. An import path is permanent once published, so an entry in `LIBRARIES` is never renamed or removed. Add a library there before its first version is fetched.

A page that moved is listed in `worker/moved.ts`, which answers its old path with a 301 to the new one. The unreleased `since-v0-7-0` page became the v0.8.0 notes that way.

### Gallery looks and votes

Each gallery entry can carry a look: the part of its config that `tuios look apply tuios.dev/r/<id>` installs. `lib/gallery/look.ts` keeps only the keys in `lib/gallery/look-keys.json`, the list tuios enforces. Refresh that file from a tuios checkout with `go run ./cmd/tuios look keys --json > lib/gallery/look-keys.json`. The next sync builds every look again and uploads the ones that changed. The sync uploads an entry's look to `gallery/look/<id>.toml` in the MEDIA bucket. `worker/look.ts` serves it at `/r/<id>.toml`, and sends `/r/<id>` to the card.

The hearts on the cards live in the `GalleryVotes` Durable Object (`worker/votes.ts`). Its migration in `wrangler.jsonc` creates it on deploy. The Turnstile site key is the public var `TURNSTILE_SITE_KEY`. The worker reads the secret as `TURNSTILE_SECRET` (`wrangler secret put TURNSTILE_SECRET`). Without the secret the hearts show counts and take no votes. Set the secret `VOTE_PEPPER` too (`wrangler secret put VOTE_PEPPER`, at least 32 random characters). It keys each like by an HMAC of the IP and the entry, so one IP likes an entry once. Without it, the key uses a salt that changes each day, and a visitor can like an entry again the next day. The Top order is `github * 3 + site` (`lib/gallery/votes.ts`).

### Release clips

The `<ReleaseClip>` videos are not in git and not in the static assets. They live in the `tuios-media` R2 bucket, bound to the Worker as `MEDIA`, and `worker/media.ts` serves `/releases/<version>/<name>.mp4` and `.webm` from it with Range support. The poster (`<name>.jpg`, `<name>-vertical.jpg`) and captions (`<name>.vtt`) of each clip stay in `public/releases/<version>/`. `.gitignore` keeps video files out of `public/releases/`.

To add a release's clips, upload them before the page that uses them deploys:

```bash
scripts/upload-release-media.sh v0.8.0 ~/dev/tuios-media/releases/v0.8.0/site
```

`--local` as a third argument fills the bucket `wrangler dev` uses instead. The masters and the source of the v0.8.0 clips are kept outside the repository in `~/dev/tuios-media/releases/v0.8.0/`.

## Learn page

`/learn` runs the real tuios in the browser: tuios compiled to WebAssembly with a pretend shell, drawn by sip's WebTerm. The pieces:

- `components/learn/`: the hub (live hero and track cards), the lesson screen, the finish panel with the share card, and the phone preview.
- `lib/learn/`: `runtime.ts` loads and boots the wasm, `engine.ts` runs a track from tuios's event stream, `matchers.ts` has the step checks, and `tracks/` holds one file per track. Add a track by writing a file there and listing it in `tracks/index.ts`. `bun test lib/` checks the engine and every track.
- The engine files are not in git. `bun scripts/learn-engine.mjs <dir>` copies a tuios browser build (what `cmd/tuios-wasm/build.sh` in tuios writes) into `public/learn/engine/<hash>/` and writes `public/learn/engine.json`. Without them the page shows that the engine is missing and everything else still builds.
- Deploy builds tuios at the commit in `learn/TUIOS_REF`. Bump that file to teach a newer tuios.
- Only a gzipped wasm ships, because the raw file is over the 25 MiB asset limit. The page unpacks it with `DecompressionStream`, so it needs no special headers on any host.

## In the wild page

`/in-the-wild` shows the mentions of tuios that the maintainer featured. The list is [hearsay](https://github.com/Gaurav-Gosain/hearsay), a terminal mentions viewer, compiled to WebAssembly and drawn by sip's WebTerm, as on `/learn`.

- `app/in-the-wild/` is the page, and `components/in-the-wild/wild-viewer.tsx` loads and starts the viewer. With no feed or an empty feed, the page says that nothing is featured and starts nothing.
- The engine files are not in git. `bun scripts/in-the-wild-engine.mjs <dir>` copies a hearsay browser build (what `wasm/build.sh` in hearsay writes) into `public/in-the-wild/engine/<hash>/` and writes `public/in-the-wild/engine.json`. Deploy builds hearsay at the commit in `in-the-wild/HEARSAY_REF`.
- The feed is not in git either. `worker/wild.ts` serves `/in-the-wild/feed` from `mentions/featured.json` in the MEDIA bucket, cached for five minutes. Make it with `hearsay publish` on the tracker's machine, then upload it with `scripts/upload-in-the-wild.sh <public.json>`. The script refuses a file with private fields in it.
- Triage in the viewer stays in the visitor's localStorage. Nothing goes back to the site.

## Notes

1. **Static export**: there is no server at runtime. Route handlers must be static (search uses `staticGET`, and every route sets `revalidate = false`).
2. **Generated files**: do not edit `.source/`. `fumadocs-mdx` regenerates it.
3. **Search engines**: `app/sitemap.ts` lists every docs page, post and release note, so a new page needs no sitemap edit. Every page's metadata goes through `pageMetadata` in `lib/metadata.ts`, which sets the canonical URL and the feed links; Next.js replaces `alternates` as a whole, so a page that builds its own metadata loses the feed links. Docs, posts and release notes also emit JSON-LD (`components/json-ld.tsx`). A docs page's frontmatter `description` is its meta description, so keep it a real sentence.
4. **Headers**: `public/_headers` sets a Content-Security-Policy. An external script, font or image host must be allowed there. It also marks the hashed build files and the fonts as immutable. A file under `/fonts/` must get a new name when it changes.
5. **No extensionless files**: Workers static assets send a file with no extension with no Content-Type, and the edge does not compress it. Give every generated file an extension. `scripts/check-out.mjs` fails the PR checks on one.
