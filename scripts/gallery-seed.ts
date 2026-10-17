// Builds the reviewed seed of the gallery: lib/gallery/gallery-seed.json and
// the stills in public/gallery-seed/. The seed ships with the site and the
// page merges it with the synced feed.
//
//   bun scripts/gallery-seed.ts <rices-dir> <stills-dir> [--date YYYY-MM-DD]
//
// <rices-dir> holds one folder per setup with its config.toml and, when it
// has one, its theme as a .json file. <stills-dir> holds <name>.png, a
// screenshot of that setup taken with tuios. Each still goes through the
// same re-encode as a submission. Running it again replaces the seed.

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DISCUSSION_URL,
  type GalleryEntry,
  type GalleryFile,
} from "../lib/gallery/feed";
import { APPROVER } from "../lib/gallery/filter";
import { reencode } from "../lib/gallery/image";
import { cleanText } from "../lib/gallery/text";

const [ricesDir, stillsDir] = process.argv.slice(2);
if (!ricesDir || !stillsDir) {
  console.error(
    "usage: gallery-seed.ts <rices-dir> <stills-dir> [--date YYYY-MM-DD]",
  );
  process.exit(2);
}
const dateAt = process.argv.indexOf("--date");
const date =
  dateAt > 0 ? process.argv[dateAt + 1] : new Date().toISOString().slice(0, 10);

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public/gallery-seed");
await mkdir(outDir, { recursive: true });

const entries: GalleryEntry[] = [];
for (const name of (await readdir(ricesDir)).sort()) {
  if (!/^[a-z0-9-]{1,40}$/.test(name)) continue;
  const dir = path.join(ricesDir, name);
  const still = path.join(stillsDir, `${name}.png`);
  let png: Buffer;
  try {
    png = await readFile(still);
  } catch {
    console.error(`skip ${name}: no ${still}`);
    continue;
  }
  const files: GalleryFile[] = [
    {
      label: "config",
      text: cleanText(
        await readFile(path.join(dir, "config.toml"), "utf8"),
      ).trim(),
    },
  ];
  const theme = (await readdir(dir)).find((f) => f.endsWith(".json"));
  if (theme) {
    files.push({
      label: "theme",
      text: cleanText(await readFile(path.join(dir, theme), "utf8")).trim(),
    });
  }
  const encoded = await reencode(png);
  await writeFile(path.join(outDir, `${name}.webp`), encoded.full);
  await writeFile(path.join(outDir, `${name}-thumb.webp`), encoded.thumb);
  entries.push({
    id: `seed-${name}`,
    login: APPROVER,
    url: DISCUSSION_URL,
    date,
    thumb: `/gallery-seed/${name}-thumb.webp`,
    full: `/gallery-seed/${name}.webp`,
    width: encoded.width,
    height: encoded.height,
    files,
    title: name,
  });
  console.log(
    `${name}: ${encoded.width}x${encoded.height}, ${theme ? "with" : "no"} theme`,
  );
}

await writeFile(
  path.join(root, "lib/gallery/gallery-seed.json"),
  `${JSON.stringify({ version: 1, updated: date, entries }, null, 2)}\n`,
);
console.log(`Wrote ${entries.length} seed entries.`);
