import { describe, expect, test } from "bun:test";
import { galleryObject, serveGallery } from "./gallery";
import type { MediaBucket } from "./media";

const HASH = "0123456789abcdef0123456789abcdef";

describe("galleryObject", () => {
  const cases: [string, string | null][] = [
    ["/gallery/feed", "gallery/gallery.json"],
    [`/gallery/img/${HASH}/full`, `gallery/img/${HASH}-full.webp`],
    [`/gallery/img/${HASH}/thumb`, `gallery/img/${HASH}-thumb.webp`],
    // The page is a static asset.
    ["/gallery", null],
    // No other key in the bucket is reachable.
    ["/gallery/gallery.json", null],
    [`/gallery/img/${HASH}/../../releases/v0.8.0/tiling.mp4`, null],
    [`/gallery/img/${HASH.toUpperCase()}/full`, null],
    [`/gallery/img/${HASH}/huge`, null],
    [`/gallery/img/${HASH}0/full`, null],
    ["/gallery/feed/", null],
  ];
  for (const [path, key] of cases)
    test(path, () => expect(galleryObject(path)?.key ?? null).toBe(key));
});

function bucket(objects: Record<string, string>): MediaBucket {
  const make = (key: string, body: boolean) => {
    const data = objects[key];
    if (data === undefined) return null;
    const object = {
      key,
      size: data.length,
      httpEtag: `"etag-${key}"`,
      writeHttpMetadata(h: Headers) {
        // A wrong type on the object must not reach the client.
        h.set("Content-Type", "text/html");
      },
    };
    return body ? { ...object, body: new Response(data).body } : object;
  };
  return {
    head: async (key: string) => make(key, false),
    get: async (key: string, options?: { onlyIf?: Headers }) => {
      const inm = options?.onlyIf?.get?.("if-none-match");
      if (inm && inm === `"etag-${key}"`) return make(key, false);
      return make(key, true);
    },
  } as unknown as MediaBucket;
}

describe("serveGallery", () => {
  const b = bucket({
    "gallery/gallery.json": '{"version":1,"entries":[]}',
    [`gallery/img/${HASH}-thumb.webp`]: "RIFF....WEBP",
  });
  const get = (path: string, headers: Record<string, string> = {}) => {
    const object = galleryObject(path);
    if (!object) throw new Error("no object");
    return serveGallery(
      new Request(`https://tuios.dev${path}`, { headers }),
      b,
      object,
    );
  };

  test("an image is WebP, immutable, and nosniff", async () => {
    const res = await get(`/gallery/img/${HASH}/thumb`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/webp");
    expect(res.headers.get("cache-control")).toContain("immutable");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });
  test("the feed is JSON with a short cache", async () => {
    const res = await get("/gallery/feed");
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(res.headers.get("cache-control")).toBe("public, max-age=300");
    expect(await res.json()).toEqual({ version: 1, entries: [] });
  });
  test("a matching ETag answers 304", async () => {
    const res = await get("/gallery/feed", {
      "if-none-match": '"etag-gallery/gallery.json"',
    });
    expect(res.status).toBe(304);
  });
  test("a missing image is 404", async () => {
    const res = await get(`/gallery/img/${HASH}/full`);
    expect(res.status).toBe(404);
  });
  test("POST is refused", async () => {
    const object = galleryObject("/gallery/feed");
    if (!object) throw new Error("no object");
    const res = await serveGallery(
      new Request("https://tuios.dev/gallery/feed", { method: "POST" }),
      b,
      object,
    );
    expect(res.status).toBe(405);
  });
});
