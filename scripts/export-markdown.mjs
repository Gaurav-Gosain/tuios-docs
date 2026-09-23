// Writes each page's markdown twin into the static export, next to the page:
// out/docs/sessions.md beside out/docs/sessions.html, out/blog.md, and
// out/index.md for the home page. The content comes from out/md-export.json,
// which app/md-export.json/route.ts builds during `next build`; that file is
// removed once its entries are written, since it is not meant to be served.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const out = path.resolve("out");
const manifest = path.join(out, "md-export.json");

const files = JSON.parse(await readFile(manifest, "utf8"));
let count = 0;
for (const [urlPath, text] of Object.entries(files)) {
  const target = path.join(out, urlPath);
  if (!target.startsWith(out + path.sep)) {
    throw new Error(`markdown path escapes the export: ${urlPath}`);
  }
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, text);
  count++;
}
await rm(manifest);
console.log(`wrote ${count} markdown pages`);
