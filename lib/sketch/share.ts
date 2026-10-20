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

async function pipe(bytes: Uint8Array, stream: GenericTransformStream) {
  const body = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(body).arrayBuffer());
}

/** The hash for a diagram and a theme. */
export async function encodeHash(code: string, theme: string) {
  const packed = await pipe(
    new TextEncoder().encode(code),
    new CompressionStream("deflate-raw"),
  );
  const p = new URLSearchParams();
  p.set("code", toBase64Url(packed));
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
    );
    // A link cannot ask for more text than the renderer takes.
    if (bytes.length > 20_000) return null;
    return {
      code: new TextDecoder().decode(bytes),
      theme: p.get("theme") ?? "",
    };
  } catch {
    return null;
  }
}
