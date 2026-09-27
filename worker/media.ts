/**
 * Release clips are served from R2, not from the static assets. A release
 * page ships about 26 clips at 120 fps (a landscape WebM and MP4 and a portrait
 * MP4 each), which fit the 25 MiB asset limit one by one but would add
 * hundreds of megabytes to the git history with every release and every
 * re-cut. They live in the MEDIA bucket instead, under the same key as their
 * URL path without the leading slash, and scripts/upload-release-media.sh puts
 * them there. Posters (.jpg) and captions (.vtt) are small and stay in
 * public/.
 *
 * The URLs do not change: /releases/v0.8.0/tiling.mp4 is the object
 * releases/v0.8.0/tiling.mp4. Serving them from this origin keeps them under
 * the page's Content-Security-Policy (default-src 'self') with no new host.
 *
 * A video element asks for byte ranges (Safari will not play a file whose
 * server ignores Range), so this answers Range with 206 and Content-Range,
 * and If-None-Match with 304.
 */

/** Extensions served from the bucket. Everything else is a static asset. */
const TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

/**
 * The clips may be re-cut after a release, and the URL stays the same, so the
 * cache is a day rather than forever. The ETag lets a browser revalidate
 * cheaply after that.
 */
const CACHE_CONTROL = "public, max-age=86400";

/**
 * The bucket key for a request path, or null when the path is not a release
 * clip. Only /releases/<version>/<name>.<mp4|webm> is served from R2, with no
 * dot segments or empty segments.
 */
export function mediaKey(pathname: string): string | null {
  const match =
    /^\/releases\/(v\d+\.\d+\.\d+)\/([a-z0-9][a-z0-9-]*)(\.mp4|\.webm)$/.exec(
      pathname,
    );
  if (!match) return null;
  return `releases/${match[1]}/${match[2]}${match[3]}`;
}

/** The parts of R2 that serveMedia uses, so tests can pass a fake bucket. */
export type MediaBucket = Pick<R2Bucket, "get" | "head">;

/** Serves a release clip from the bucket, answering Range and If-None-Match. */
export async function serveMedia(
  request: Request,
  bucket: MediaBucket,
  key: string,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed\n", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }

  if (request.method === "HEAD") {
    const object = await bucket.head(key);
    if (!object) return notFound();
    return new Response(null, { headers: headersFor(object, key) });
  }

  const range = request.headers.get("range");
  let object: R2Object | R2ObjectBody | null;
  try {
    object = await bucket.get(key, {
      onlyIf: request.headers,
      range: range ? request.headers : undefined,
    });
  } catch {
    // R2 throws on a range it cannot satisfy, such as one past the end.
    const head = await bucket.head(key);
    if (!head) return notFound();
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${head.size}` },
    });
  }
  if (!object) return notFound();

  const headers = headersFor(object, key);
  // No body: a precondition in onlyIf failed. For If-None-Match that means
  // the browser's copy is current.
  if (!("body" in object)) {
    return new Response(null, { status: 304, headers });
  }

  if (range && object.range) {
    const { offset, length } = resolveRange(object.range, object.size);
    headers.set(
      "Content-Range",
      `bytes ${offset}-${offset + length - 1}/${object.size}`,
    );
    headers.set("Content-Length", String(length));
    return new Response(object.body, { status: 206, headers });
  }
  headers.set("Content-Length", String(object.size));
  return new Response(object.body, { headers });
}

function headersFor(object: R2Object, key: string): Headers {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  if (!headers.has("Content-Type")) {
    const ext = key.slice(key.lastIndexOf("."));
    headers.set("Content-Type", TYPES[ext] ?? "application/octet-stream");
  }
  headers.set("ETag", object.httpEtag);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", CACHE_CONTROL);
  return headers;
}

/** The first byte and the byte count of the range R2 returned. */
export function resolveRange(
  range: R2Range,
  size: number,
): { offset: number; length: number } {
  if ("suffix" in range && range.suffix !== undefined) {
    const length = Math.min(range.suffix, size);
    return { offset: size - length, length };
  }
  const offset =
    "offset" in range && range.offset !== undefined ? range.offset : 0;
  const length =
    "length" in range && range.length !== undefined
      ? Math.min(range.length, size - offset)
      : size - offset;
  return { offset, length };
}

function notFound() {
  return new Response("Not Found\n", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
