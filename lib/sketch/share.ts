/**
 * The playground's state in the URL hash, so a link opens the same diagram:
 * #code=<deflate-raw, base64url>&theme=<name>.
 */

function toBase64Url(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/** The most text a link may carry: the renderer takes no more. */
const MAX_BYTES = 20_000;

/**
 * Runs bytes through a stream. Stops and returns null once the output passes
 * limit, so a small link cannot inflate to gigabytes first.
 */
async function pipe(
  bytes: Uint8Array,
  stream: GenericTransformStream,
  limit = Number.POSITIVE_INFINITY,
): Promise<Uint8Array | null> {
  const reader = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(stream)
    .getReader();
  const parts: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel().catch(() => {});
      return null;
    }
    parts.push(value);
  }
  const out = new Uint8Array(size);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.byteLength;
  }
  return out;
}

/** The hash for a diagram and a theme. */
export async function encodeHash(code: string, theme: string) {
  const packed = await pipe(
    new TextEncoder().encode(code),
    new CompressionStream("deflate-raw"),
  );
  const p = new URLSearchParams();
  p.set("code", toBase64Url(packed ?? new Uint8Array()));
  if (theme) p.set("theme", theme);
  return `#${p.toString()}`;
}

/** The diagram and theme in a hash, or null when it holds none. */
export async function decodeHash(
  hash: string,
): Promise<{ code: string; theme: string } | null> {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  const code = p.get("code");
  if (!code) return null;
  try {
    const bytes = await pipe(
      fromBase64Url(code),
      new DecompressionStream("deflate-raw"),
      MAX_BYTES,
    );
    if (!bytes) return null;
    return {
      code: new TextDecoder().decode(bytes),
      theme: p.get("theme") ?? "",
    };
  } catch {
    return null;
  }
}
