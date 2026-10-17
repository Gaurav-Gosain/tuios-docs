/**
 * Builds the gallery feed from the approved comments. Each image is
 * downloaded and re-encoded once: the feed records the hash of its source
 * URL and of its bytes, and the next sync reuses both for an image it has
 * published before.
 */

import { createHash } from "node:crypto";
import {
  DISCUSSION_URL,
  type GalleryEntry,
  type GalleryFeed,
  type GalleryFile,
  imagePath,
} from "./feed";
import type { DiscussionComment } from "./filter";
import type { Encoded } from "./image";
import {
  firstCodeBlock,
  firstImageUrl,
  isAllowedImageUrl,
  normalizeImageUrl,
  shownImageProblem,
} from "./text";

export function hash32(data: string | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex").slice(0, 32);
}

/** An image the sync must upload: both sizes, keyed by hash. */
export type Upload = { hash: string; full: Buffer; thumb: Buffer };

export type BuildResult = {
  feed: GalleryFeed;
  uploads: Upload[];
  /** Hashes the previous feed had and this one does not. */
  orphans: string[];
  log: string[];
};

export type BuildDeps = {
  download: (url: string) => Promise<Uint8Array>;
  reencode: (bytes: Uint8Array) => Promise<Encoded>;
  now?: () => Date;
};

export async function buildFeed(
  approved: DiscussionComment[],
  previous: GalleryEntry[],
  deps: BuildDeps,
): Promise<BuildResult> {
  const log: string[] = [];
  const bySrc = new Map<string, GalleryEntry>();
  const byHash = new Map<string, GalleryEntry>();
  for (const entry of previous) {
    if (entry.src) bySrc.set(entry.src, entry);
    if (entry.hash) byHash.set(entry.hash, entry);
  }

  const entries: GalleryEntry[] = [];
  const uploads = new Map<string, Upload>();
  for (const comment of approved) {
    const who = `#${comment.id} by ${comment.author}`;
    const url = firstImageUrl(comment.body);
    if (!url) {
      log.push(`skip ${who}: no image`);
      continue;
    }
    if (!isAllowedImageUrl(url)) {
      log.push(`skip ${who}: the first image is not on a GitHub image host`);
      continue;
    }
    const hidden = shownImageProblem(url, comment.bodyHTML);
    if (hidden) {
      log.push(`skip ${who}: ${hidden}`);
      continue;
    }
    const src = hash32(normalizeImageUrl(url));
    let image: { hash: string; width: number; height: number } | undefined;
    const known = bySrc.get(src);
    if (known?.hash) {
      image = { hash: known.hash, width: known.width, height: known.height };
      log.push(`keep ${who}: image ${known.hash} is published already`);
    } else {
      try {
        const bytes = await deps.download(url);
        const hash = hash32(bytes);
        const same = byHash.get(hash);
        const queued = uploads.get(hash);
        if (same) {
          image = { hash, width: same.width, height: same.height };
          log.push(`keep ${who}: image ${hash} is published already`);
        } else if (queued) {
          const done = entries.find((e) => e.hash === hash);
          if (!done) throw new Error("queued image without an entry");
          image = { hash, width: done.width, height: done.height };
        } else {
          const encoded = await deps.reencode(bytes);
          uploads.set(hash, {
            hash,
            full: encoded.full,
            thumb: encoded.thumb,
          });
          image = { hash, width: encoded.width, height: encoded.height };
          log.push(
            `new ${who}: image ${hash}, ${encoded.width}x${encoded.height}, ${encoded.full.length + encoded.thumb.length} bytes`,
          );
        }
      } catch (err) {
        log.push(
          `skip ${who}: ${err instanceof Error ? err.message : String(err)}`,
        );
        continue;
      }
    }
    const files: GalleryFile[] = [];
    const block = firstCodeBlock(comment.body);
    if (block) files.push(block);
    entries.push({
      id: comment.id,
      login: comment.author as string,
      url: `${DISCUSSION_URL}#discussioncomment-${comment.id}`,
      date: comment.createdAt,
      thumb: imagePath(image.hash, "thumb"),
      full: imagePath(image.hash, "full"),
      width: image.width,
      height: image.height,
      files,
      hash: image.hash,
      src,
    });
  }

  const kept = new Set(entries.map((e) => e.hash));
  const orphans = [...byHash.keys()].filter((h) => !kept.has(h));
  return {
    feed: {
      version: 1,
      updated: (deps.now?.() ?? new Date()).toISOString(),
      entries,
    },
    uploads: [...uploads.values()],
    orphans,
    log,
  };
}
