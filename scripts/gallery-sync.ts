// Syncs the community gallery from discussion #849 to the MEDIA bucket.
//
//   bun scripts/gallery-sync.ts --dry-run [--out <dir>]
//   bun scripts/gallery-sync.ts --publish [--local]
//
// It reads every comment with GITHUB_TOKEN, keeps the ones the approver has
// reacted to with a rocket (see lib/gallery/filter.ts), downloads and
// re-encodes the first image of each (lib/gallery/image.ts), and builds the
// feed. Each entry gets the count of people who reacted on GitHub
// (lib/gallery/votes.ts), and, when its first code block sets a look key, a
// look file of the allowed keys only (lib/gallery/look.ts). --publish uploads
// the new images and the new or changed look files, then gallery/gallery.json,
// then deletes the images and look files no entry uses any more. --dry-run prints what it would
// publish, writes nothing to the bucket, and with --out also writes the feed
// and the images to a folder to look at. Nothing is committed to git.
//
// The previous feed comes from https://tuios.dev/gallery/feed, or from
// --previous <file>. It tells the sync which images are published already.
//
// The gallery.yml workflow runs this every hour.

import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildFeed } from "../lib/gallery/build";
import { FEED_PATH, type GalleryEntry, parseFeed } from "../lib/gallery/feed";
import { parseDenylist, selectApproved } from "../lib/gallery/filter";
import { fetchComments } from "../lib/gallery/github";
import { download, reencode } from "../lib/gallery/image";

const WRANGLER = "wrangler@4.137.0";
const BUCKET = "tuios-media";
const SITE = "https://tuios.dev";
const IMAGE_CACHE = "public, max-age=31536000, immutable";
const FEED_CACHE = "public, max-age=300";
const LOOK_CACHE = "public, max-age=300";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const value = (name: string) => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
};

const dryRun = flag("--dry-run");
const publish = flag("--publish");
if (dryRun === publish) {
  console.error(
    "usage: gallery-sync.ts --dry-run [--out <dir>] | --publish [--local]",
  );
  process.exit(2);
}
const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("GITHUB_TOKEN is not set.");
  process.exit(2);
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

async function previousFeed(): Promise<GalleryEntry[]> {
  const file = value("--previous");
  if (file) return parseFeed(JSON.parse(await readFile(file, "utf8")));
  const response = await fetch(`${SITE}${FEED_PATH}`, {
    // The */* lets a Worker without the gallery route answer with its 404
    // page rather than a 406 from the page negotiation.
    headers: { accept: "application/json, */*;q=0.1" },
    signal: AbortSignal.timeout(30_000),
  });
  // Before the first publish the path is a 404.
  if (response.status === 404) return [];
  if (
    !response.ok ||
    !response.headers.get("content-type")?.includes("application/json")
  ) {
    throw new Error(
      `${SITE}${FEED_PATH} answered ${response.status} ${response.headers.get("content-type")}`,
    );
  }
  return parseFeed(await response.json());
}

function wrangler(...command: string[]) {
  const where = flag("--local") ? "--local" : "--remote";
  const result = spawnSync("bunx", [WRANGLER, ...command, where], {
    cwd: path.join(root, "worker"),
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`wrangler ${command.slice(0, 3).join(" ")} failed`);
  }
}

const deny = parseDenylist(
  JSON.parse(
    await readFile(path.join(root, "lib/gallery/gallery-deny.json"), "utf8"),
  ),
);
const comments = await fetchComments(token);
const { approved, skipped } = selectApproved(comments, deny);
const previous = await previousFeed();
const result = await buildFeed(approved, previous, { download, reencode });

console.log(
  `${comments.length} comments, ${approved.length} approved, ${skipped.length} skipped. The previous feed has ${previous.length} entries.`,
);
for (const s of skipped) {
  console.log(`skip #${s.id} by ${s.author ?? "(deleted)"}: ${s.reason}`);
}
for (const line of result.log) console.log(line);
console.log(
  `The feed has ${result.feed.entries.length} entries, ${result.uploads.length} new images, ${result.orphans.length} images to delete, ${result.looks.length} new looks, ${result.lookOrphans.length} looks to delete.`,
);
const feedJson = `${JSON.stringify(result.feed, null, 2)}\n`;

if (dryRun) {
  console.log("Dry run. Nothing is written to the bucket.");
  console.log(feedJson);
  const out = value("--out");
  if (out) {
    await mkdir(path.join(out, "img"), { recursive: true });
    await writeFile(path.join(out, "gallery.json"), feedJson);
    for (const u of result.uploads) {
      await writeFile(path.join(out, "img", `${u.hash}-full.webp`), u.full);
      await writeFile(path.join(out, "img", `${u.hash}-thumb.webp`), u.thumb);
    }
    await mkdir(path.join(out, "look"), { recursive: true });
    for (const l of result.looks) {
      await writeFile(path.join(out, "look", `${l.id}.toml`), l.text);
    }
    console.log(
      `Wrote the feed, ${result.uploads.length * 2} images and ${result.looks.length} looks to ${out}.`,
    );
  }
  process.exit(0);
}

// Images first, so the feed never names an image that is not there yet.
const scratch = await mkdtemp(path.join(tmpdir(), "gallery-"));
try {
  for (const u of result.uploads) {
    for (const size of ["full", "thumb"] as const) {
      const file = path.join(scratch, `${u.hash}-${size}.webp`);
      await writeFile(file, u[size]);
      wrangler(
        "r2",
        "object",
        "put",
        `${BUCKET}/gallery/img/${u.hash}-${size}.webp`,
        "--file",
        file,
        "--content-type",
        "image/webp",
        "--cache-control",
        IMAGE_CACHE,
      );
    }
  }
  for (const l of result.looks) {
    const file = path.join(scratch, `${l.id}.toml`);
    await writeFile(file, l.text);
    wrangler(
      "r2",
      "object",
      "put",
      `${BUCKET}/gallery/look/${l.id}.toml`,
      "--file",
      file,
      "--content-type",
      "text/plain; charset=utf-8",
      "--cache-control",
      LOOK_CACHE,
    );
  }
  const feedFile = path.join(scratch, "gallery.json");
  await writeFile(feedFile, feedJson);
  wrangler(
    "r2",
    "object",
    "put",
    `${BUCKET}/gallery/gallery.json`,
    "--file",
    feedFile,
    "--content-type",
    "application/json",
    "--cache-control",
    FEED_CACHE,
  );
  for (const hash of result.orphans) {
    for (const size of ["full", "thumb"]) {
      wrangler(
        "r2",
        "object",
        "delete",
        `${BUCKET}/gallery/img/${hash}-${size}.webp`,
      );
    }
  }
  for (const id of result.lookOrphans) {
    wrangler("r2", "object", "delete", `${BUCKET}/gallery/look/${id}.toml`);
  }
} finally {
  await rm(scratch, { recursive: true, force: true });
}
console.log("Published.");
