/**
 * The /learn engine's wasm, compressed the way the browser asks for.
 *
 * The raw wasm is over the 25 MiB limit on one static asset, so only its
 * compressed twins ship: tuios.wasm.br and tuios.wasm.gz, side by side in the
 * engine folder (see scripts/learn-engine.mjs). The static assets serve each
 * twin as an opaque file, so a page would have to unpack it in script, and a
 * browser cannot unpack brotli in script. This answers
 * /learn/engine/<hash>/tuios.wasm instead: the brotli twin with
 * Content-Encoding: br when the browser accepts br, else the gzip twin with
 * Content-Encoding: gzip. The browser unpacks either itself, so the page
 * compiles the response as it arrives. Brotli is about 30 % smaller.
 *
 * Cloudflare rewrites the Accept-Encoding a Worker sees, and keeps the
 * browser's own in request.cf.clientAcceptEncoding, so the choice is made
 * from that. The edge passes the encoded body through to a browser that
 * accepts its coding.
 *
 * A browser that accepts neither gets 406, and the page falls back to the
 * gzip file it unpacks itself (see lib/learn/runtime.ts). So does every host
 * without this Worker, such as next dev.
 */

/** The engine folder is named by the hash of its wasm, so it never changes. */
const CACHE_CONTROL = "public, max-age=31536000, immutable";

/**
 * The asset path of the engine folder for a request path, or null when the
 * path is not an engine's wasm.
 */
export function engineWasm(pathname: string): string | null {
  const match = /^\/learn\/engine\/([0-9a-f]{6,64})\/tuios\.wasm$/.exec(
    pathname,
  );
  return match ? `/learn/engine/${match[1]}/` : null;
}

/** The quality Accept-Encoding gives a coding, 0 when it refuses it. */
export function encodingQuality(header: string | null, coding: string) {
  if (!header) return 0;
  let star: number | null = null;
  for (const part of header.split(",")) {
    const [name, ...params] = part.trim().toLowerCase().split(";");
    let q = 1;
    for (const p of params) {
      const [k, v] = p.trim().split("=");
      if (k === "q") q = Number(v);
    }
    if (!Number.isFinite(q)) q = 0;
    if (name === coding) return q;
    if (name === "*") star = q;
  }
  return star ?? 0;
}

/** The Accept-Encoding the browser sent. See the comment at the top. */
export function clientAcceptEncoding(request: Request): string | null {
  const cf = (request as { cf?: { clientAcceptEncoding?: unknown } }).cf;
  const sent = cf?.clientAcceptEncoding;
  return typeof sent === "string"
    ? sent
    : request.headers.get("accept-encoding");
}

/** The twins, best first: the file suffix and the Content-Encoding. */
const TWINS = [
  { suffix: ".br", coding: "br" },
  { suffix: ".gz", coding: "gzip" },
] as const;

/** Serves the engine's wasm from the twin the browser accepts best. */
export async function serveEngineWasm(
  request: Request,
  assets: Fetcher,
  folder: string,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed\n", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }
  const accept = clientAcceptEncoding(request);
  const base = new URL(request.url);
  for (const twin of TWINS) {
    if (encodingQuality(accept, twin.coding) <= 0) continue;
    const url = new URL(`${folder}tuios.wasm${twin.suffix}`, base);
    const headers = new Headers();
    // The file is already compressed: asked for as it is, so nothing on the
    // way packs it again or unpacks it before it is passed on.
    headers.set("Accept-Encoding", "identity");
    const etag = request.headers.get("if-none-match");
    if (etag) headers.set("If-None-Match", etag);
    const asset = await assets.fetch(
      new Request(url, { method: request.method, headers }),
    );
    if (asset.status !== 200 && asset.status !== 304) {
      // An engine built before the brotli twin shipped has only the gzip one.
      await asset.body?.cancel();
      continue;
    }
    const out = new Headers({
      "Content-Type": "application/wasm",
      "Content-Encoding": twin.coding,
      "Cache-Control": CACHE_CONTROL,
      Vary: "Accept-Encoding",
    });
    const tag = asset.headers.get("etag");
    if (tag) out.set("ETag", tag);
    if (asset.status === 304) {
      return new Response(null, { status: 304, headers: out });
    }
    const length = asset.headers.get("content-length");
    if (length) out.set("Content-Length", length);
    // manual: the body is sent as it is, already encoded, rather than
    // compressed again by the runtime to match the header.
    return new Response(request.method === "HEAD" ? null : asset.body, {
      status: 200,
      headers: out,
      encodeBody: "manual",
    });
  }
  return new Response("Not Acceptable\n\nAvailable: br, gzip\n", {
    status: 406,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      Vary: "Accept-Encoding",
    },
  });
}
