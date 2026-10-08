/**
 * Next.js in static export mode prefetches every link it shows. For each one
 * it first fetches the page's HTML with `Range: bytes=0-63` and reads only the
 * build id comment at the start of the document (see
 * next/dist/shared/lib/segment-cache/output-export-prefetch-encoding.js).
 * Workers static assets ignore Range and answer 200 with the whole page, and
 * Chromium asks for no compression on a Range request. So every page view
 * downloaded every linked page in full and uncompressed: 61 fetches and about
 * 5.8 MB on /docs/getting-started.
 *
 * The Worker answers that one shape of request itself: a single range that
 * starts at byte 0, on a page that would otherwise come back as 200 HTML. It
 * reads the first bytes of the body and returns 206. Any other Range (a
 * suffix, several ranges, a start past 0, an If-Range) is left alone, and the
 * assets answer 200 with the whole page as before, which a client must accept.
 */

/**
 * The largest prefix the Worker slices. Next asks for 64 bytes. A larger
 * range goes to the assets like any other.
 */
const MAX_PREFIX = 64 * 1024;

/**
 * The last byte index asked for by a `bytes=0-N` Range header, or null for
 * any other value (no header, a suffix range, an open range, a start other
 * than 0, or more than one range).
 */
export function prefixRangeEnd(header: string | null): number | null {
  if (header === null) return null;
  const match = /^\s*bytes\s*=\s*0\s*-\s*(\d{1,15})\s*$/i.exec(header);
  if (!match) return null;
  return Number(match[1]);
}

/**
 * The response to send for `request` given the full 200 response `res`.
 * When the request is a GET with a `bytes=0-N` Range and no If-Range, and
 * `res` is a 200 HTML page, it returns a 206 with the first N+1 bytes (or the
 * whole body when it is shorter) and a Content-Range. Otherwise it returns
 * `res` unchanged.
 */
export async function answerPrefixRange(
  request: Request,
  res: Response,
): Promise<Response> {
  if (request.method !== "GET" || request.headers.has("if-range")) return res;
  const end = prefixRangeEnd(request.headers.get("range"));
  if (end === null || end >= MAX_PREFIX) return res;
  if (res.status !== 200 || !res.body) return res;
  if (!res.headers.get("content-type")?.includes("text/html")) return res;

  const want = end + 1;
  const head = await readPrefix(res.body, want);
  // An empty body has no byte 0, so no range of it can be satisfied. The
  // whole (empty) 200 is still a correct answer. The body was read, so the
  // response is rebuilt without it.
  if (head.length === 0) {
    return new Response(null, { status: 200, headers: res.headers });
  }

  const headers = new Headers(res.headers);
  // The slice is identity bytes. A total length is known only when the
  // stored length is of those same bytes.
  const encoded = headers.has("content-encoding");
  const stored = Number(headers.get("content-length"));
  let total = "*";
  if (!encoded && Number.isFinite(stored) && stored > 0) {
    total = String(stored);
  } else if (head.length < want) {
    // The stream ended before the range did, so this is the whole body.
    total = String(head.length);
  }
  headers.delete("content-encoding");
  headers.set("content-length", String(head.length));
  headers.set("content-range", `bytes 0-${head.length - 1}/${total}`);
  headers.set("accept-ranges", "bytes");
  return new Response(head, { status: 206, headers });
}

/** Reads at most `limit` bytes from `body`, then stops reading. */
async function readPrefix(
  body: ReadableStream<Uint8Array>,
  limit: number,
): Promise<Uint8Array> {
  const reader = body.getReader();
  const out = new Uint8Array(limit);
  let filled = 0;
  try {
    while (filled < limit) {
      const { done, value } = await reader.read();
      if (done) break;
      const take = Math.min(value.length, limit - filled);
      out.set(value.subarray(0, take), filled);
      filled += take;
    }
  } finally {
    // The rest of the page is not needed.
    await reader.cancel().catch(() => {});
  }
  return out.subarray(0, filled);
}
