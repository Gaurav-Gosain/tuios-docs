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
//
// Each setup also gets a look file, public/gallery-seed/<name>.look.toml,
// that `tuios look apply tuios.dev/r/<name>` installs (see
// lib/gallery/look.ts). To make the look files again from the committed seed
// alone, after a change to look.ts or look-keys.json:
//
//   bun scripts/gallery-seed.ts --looks-only
//
// Run bun run format afterwards: Biome lays out the seed JSON's short arrays
// on one line.

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { annotate } from "../lib/gallery/annotate";
import { hash32 } from "../lib/gallery/build";
import {
  DISCUSSION_URL,
  type GalleryEntry,
  type GalleryFile,
  parseFeed,
} from "../lib/gallery/feed";
import { APPROVER } from "../lib/gallery/filter";
import { reencode } from "../lib/gallery/image";
import { buildLook } from "../lib/gallery/look";
import { cleanText } from "../lib/gallery/text";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public/gallery-seed");
const seedFile = path.join(root, "lib/gallery/gallery-seed.json");

/** Writes the look file of a seed entry and records it on the entry. */
async function writeLook(entry: GalleryEntry, name: string) {
  for (const file of entry.files) {
    delete file.notes;
    if (file.label !== "config") continue;
    const notes = annotate(file.text);
    if (notes.length > 0) file.notes = notes;
  }
  const look = buildLook({
    config: entry.files.find((f) => f.label === "config")?.text ?? "",
    theme: entry.files.find((f) => f.label === "theme")?.text,
    id: name,
    name,
    author: entry.login,
  });
  delete entry.look;
  if (!look) return;
  await writeFile(path.join(outDir, `${name}.look.toml`), look.text);
  entry.look = {
    id: name,
    left: look.left,
    leftCount: look.leftCount,
    hash: hash32(look.text),
  };
  console.log(
    `${name}: look with ${look.keys} keys, ${look.leftCount} left out`,
  );
}

if (process.argv.includes("--looks-only")) {
  const seed = JSON.parse(await readFile(seedFile, "utf8"));
  const entries = parseFeed(seed);
  for (const entry of entries) {
    if (entry.title) await writeLook(entry, entry.title);
  }
  await writeFile(
    seedFile,
    `${JSON.stringify({ ...seed, entries }, null, 2)}\n`,
  );
  process.exit(0);
}

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
  const entry: GalleryEntry = {
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
  };
  await writeLook(entry, name);
  entries.push(entry);
  console.log(
    `${name}: ${encoded.width}x${encoded.height}, ${theme ? "with" : "no"} theme`,
  );
}

await writeFile(
  seedFile,
  `${JSON.stringify({ version: 1, updated: date, entries }, null, 2)}\n`,
);
console.log(`Wrote ${entries.length} seed entries.`);
