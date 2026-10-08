// Checks the static export in out/ before it deploys. Run it after
// `bun run build`: bun scripts/check-out.mjs
//
// 1. No file without an extension. Workers static assets send such a file with
//    no Content-Type, and the edge does not compress a response with none.
//    The search index was one (out/api/search, 9 MB sent raw).
// 2. Every internal link on every page points to a file in out/, and every
//    #anchor names an id on the target page.
//
// It prints each problem and exits 1 when it finds any.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const out = path.resolve(process.argv[2] ?? "out");
const SITE = "https://tuios.dev";

// Files Cloudflare reads as configuration, not served as assets.
const CONFIG_FILES = new Set(["_headers", "_redirects", "CNAME"]);

// Release clips are served from R2 by the Worker (worker/media.ts), not from
// out/, so a link to one cannot be checked here.
const R2_EXTENSIONS = new Set([".mp4", ".webm"]);

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

const files = await walk(out);
const rel = new Set(
  files.map((f) => path.relative(out, f).split(path.sep).join("/")),
);
const problems = [];

for (const file of rel) {
  const base = file.split("/").pop();
  if (CONFIG_FILES.has(base)) continue;
  if (path.extname(base) === "") {
    problems.push(`no extension, so no Content-Type: /${file}`);
  }
}

// Paths that _redirects answers count as existing.
const redirects = new Set();
if (rel.has("_redirects")) {
  for (const line of (
    await readFile(path.join(out, "_redirects"), "utf8")
  ).split("\n")) {
    const source = line.trim().split(/\s+/)[0];
    if (source && !source.startsWith("#")) redirects.add(source);
  }
}

/** The file in out/ that a URL path is served from, or null. */
function fileFor(pathname) {
  let p = decodeURIComponent(pathname).replace(/^\/+/, "");
  if (p === "" || p.endsWith("/")) {
    p = p.replace(/\/$/, "");
    const candidates =
      p === "" ? ["index.html"] : [`${p}/index.html`, `${p}.html`];
    return candidates.find((c) => rel.has(c)) ?? null;
  }
  for (const c of [p, `${p}.html`, `${p}/index.html`]) {
    if (rel.has(c)) return c;
  }
  return null;
}

/** The URL path a page file is served at. */
function urlFor(file) {
  if (file === "index.html") return "/";
  return `/${file.replace(/(\/index)?\.html$/, "")}`;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

const ids = new Map();
async function idsOf(file) {
  if (!ids.has(file)) {
    const html = await readFile(path.join(out, file), "utf8");
    ids.set(
      file,
      new Set(
        [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => decodeEntities(m[1])),
      ),
    );
  }
  return ids.get(file);
}

const pages = [...rel].filter((f) => f.endsWith(".html"));
let links = 0;
for (const page of pages) {
  const html = await readFile(path.join(out, page), "utf8");
  const base = new URL(urlFor(page), SITE);
  for (const match of html.matchAll(/<a\s[^>]*?href="([^"]*)"/g)) {
    const href = decodeEntities(match[1]);
    if (/^(mailto|tel|javascript):/i.test(href)) continue;
    let url;
    try {
      url = new URL(href, base);
    } catch {
      problems.push(`bad link ${href} on ${urlFor(page)}`);
      continue;
    }
    if (url.origin !== SITE) continue;
    if (R2_EXTENSIONS.has(path.extname(url.pathname))) continue;
    links++;
    if (redirects.has(url.pathname)) continue;
    const target = fileFor(url.pathname);
    if (!target) {
      problems.push(`broken link ${url.pathname} on ${urlFor(page)}`);
      continue;
    }
    const frag = decodeURIComponent(url.hash.slice(1));
    if (frag && target.endsWith(".html") && !(await idsOf(target)).has(frag)) {
      problems.push(
        `missing anchor ${url.pathname}#${frag} on ${urlFor(page)}`,
      );
    }
  }
}

console.log(
  `${rel.size} files, ${pages.length} pages, ${links} internal links`,
);
for (const p of problems) console.log(p);
if (problems.length > 0) {
  console.log(`${problems.length} problems`);
  process.exit(1);
}
console.log("no problems");
