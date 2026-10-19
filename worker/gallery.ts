/**
 * The community gallery's feed and images, served from the MEDIA bucket. The
 * sync (scripts/gallery-sync.ts) writes them under gallery/ and nothing else
 * does. The /gallery page itself is a static asset.
 *
 * The URLs have no file extension on purpose. wrangler.jsonc keeps every
 * .json and .webp path away from the Worker, and a "!" pattern there wins
 * over any other, so /gallery/gallery.json would never reach this code.
 *
 *   /gallery/feed                 -> gallery/gallery.json
 *   /gallery/img/<hash>/full      -> gallery/img/<hash>-full.webp
 *   /gallery/img/<hash>/thumb     -> gallery/img/<hash>-thumb.webp
 *
 * An image is named by the hash of its content, so it never changes and is
 * cached for a year. The feed changes with each sync, and a removed entry
 * must go away soon, so it is cached for five minutes.
 */

import type { MediaBucket } from "./media";

export type GalleryObject = { key: string; type: string; cache: string };

const IMAGE_CACHE = "public, max-age=31536000, immutable";
const FEED_CACHE = "public, max-age=300";

/** The bucket object for a request path, or null when it is not one. */
export function galleryObject(pathname: string): GalleryObject | null {
  if (pathname === "/gallery/feed") {
    return {
      key: "gallery/gallery.json",
      type: "application/json; charset=utf-8",
      cache: FEED_CACHE,
    };
  }
  const match = /^\/gallery\/img\/([0-9a-f]{32})\/(full|thumb)$/.exec(pathname);
  if (!match) return null;
  return {
    key: `gallery/img/${match[1]}-${match[2]}.webp`,
    type: "image/webp",
    cache: IMAGE_CACHE,
  };
}

/** Serves a gallery object, answering If-None-Match with 304. */
export async function serveGallery(
  request: Request,
  bucket: MediaBucket,
  object: GalleryObject,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed\n", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }
  const found =
    request.method === "HEAD"
      ? await bucket.head(object.key)
      : await bucket.get(object.key, { onlyIf: request.headers });
  if (!found) {
    return new Response("Not Found\n", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  }
  // The type comes from the path, never from the object's metadata, and
  // nosniff keeps a browser from guessing another.
  const headers = new Headers({
    "Content-Type": object.type,
    "Cache-Control": object.cache,
    ETag: found.httpEtag,
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'",
  });
  if (request.method === "HEAD") {
    headers.set("Content-Length", String(found.size));
    return new Response(null, { headers });
  }
  if (!("body" in found)) return new Response(null, { status: 304, headers });
  headers.set("Content-Length", String(found.size));
  return new Response(found.body, { headers });
}
