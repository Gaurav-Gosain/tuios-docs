/**
 * Downloading and re-encoding a submission's image. This is a security
 * boundary: the bytes come from anyone who can comment on GitHub.
 *
 * - The download follows redirects only to GitHub's image hosts and stops at
 *   MAX_BYTES.
 * - The header is read before anything decodes the image. Only PNG, JPEG,
 *   GIF and WebP pass, and only up to MAX_PIXELS.
 * - The image is decoded in full and encoded again as WebP. The new file
 *   holds pixels and nothing else, so EXIF, GPS and any data appended to the
 *   original (a polyglot) do not reach the site.
 *
 * Only the sync imports this file. The page never does.
 */

import sharp from "sharp";
import { isAllowedImageUrl, isAllowedRedirect } from "./text";

/** The largest download, in bytes. */
export const MAX_BYTES = 10 * 1024 * 1024;
/** The largest image, in pixels, checked from the header before decoding. */
export const MAX_PIXELS = 25_000_000;
/** The width of the full still and of the thumbnail. */
export const FULL_WIDTH = 1600;
export const THUMB_WIDTH = 800;

export type ImageHeader = {
  type: "png" | "jpeg" | "gif" | "webp";
  width: number;
  height: number;
};

export class ImageRejected extends Error {}

/**
 * The type and size an image's header claims, or null when the bytes are not
 * a PNG, JPEG, GIF or WebP. Nothing is decoded.
 */
export function readHeader(bytes: Uint8Array): ImageHeader | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const has = (n: number) => bytes.length >= n;
  const ascii = (at: number, s: string) =>
    has(at + s.length) &&
    [...s].every((c, i) => bytes[at + i] === c.charCodeAt(0));

  // PNG: the signature, then IHDR first with the width and height.
  if (has(24) && ascii(1, "PNG") && bytes[0] === 0x89 && ascii(12, "IHDR")) {
    return {
      type: "png",
      width: view.getUint32(16),
      height: view.getUint32(20),
    };
  }
  // GIF: the logical screen size. A frame cannot be larger than it is drawn
  // into, and sharp reads only the first frame.
  if (has(10) && (ascii(0, "GIF87a") || ascii(0, "GIF89a"))) {
    return {
      type: "gif",
      width: view.getUint16(6, true),
      height: view.getUint16(8, true),
    };
  }
  // WebP: one of the three chunk kinds.
  if (has(30) && ascii(0, "RIFF") && ascii(8, "WEBP")) {
    if (ascii(12, "VP8 ")) {
      return {
        type: "webp",
        width: view.getUint16(26, true) & 0x3fff,
        height: view.getUint16(28, true) & 0x3fff,
      };
    }
    if (ascii(12, "VP8L") && bytes[20] === 0x2f) {
      const b = view.getUint32(21, true);
      return {
        type: "webp",
        width: (b & 0x3fff) + 1,
        height: ((b >> 14) & 0x3fff) + 1,
      };
    }
    if (ascii(12, "VP8X")) {
      const w = bytes[24] | (bytes[25] << 8) | (bytes[26] << 16);
      const h = bytes[27] | (bytes[28] << 8) | (bytes[29] << 16);
      return { type: "webp", width: w + 1, height: h + 1 };
    }
    return null;
  }
  // JPEG: walk the segments to the first start-of-frame marker.
  if (has(4) && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let at = 2;
    while (at + 9 < bytes.length) {
      if (bytes[at] !== 0xff) return null;
      const marker = bytes[at + 1];
      if (marker === 0xff) {
        at++;
        continue;
      }
      const isSof =
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc;
      if (isSof) {
        return {
          type: "jpeg",
          height: view.getUint16(at + 5),
          width: view.getUint16(at + 7),
        };
      }
      const length = view.getUint16(at + 2);
      if (length < 2) return null;
      at += 2 + length;
    }
    return null;
  }
  return null;
}

/** Throws ImageRejected unless the header is a known type within the limits. */
export function checkHeader(bytes: Uint8Array): ImageHeader {
  const header = readHeader(bytes);
  if (!header) throw new ImageRejected("not a PNG, JPEG, GIF or WebP image");
  const { width, height } = header;
  if (width < 1 || height < 1) throw new ImageRejected("the image has no size");
  if (width * height > MAX_PIXELS) {
    throw new ImageRejected(
      `${width}x${height} is more than ${MAX_PIXELS / 1_000_000} megapixels`,
    );
  }
  return header;
}

export type Encoded = {
  full: Buffer;
  thumb: Buffer;
  width: number;
  height: number;
};

/**
 * Decodes the image in full and encodes it again as a WebP at most
 * FULL_WIDTH wide and a WebP thumbnail THUMB_WIDTH wide. Throws
 * ImageRejected when the header fails the checks or the image does not
 * decode.
 */
export async function reencode(bytes: Uint8Array): Promise<Encoded> {
  if (bytes.length > MAX_BYTES) {
    throw new ImageRejected(`the image is more than ${MAX_BYTES} bytes`);
  }
  checkHeader(bytes);
  // sharp checks the pixel limit again from its own reading of the header,
  // and failOn "truncated" makes a cut-off file an error rather than a
  // partly grey picture.
  const options = {
    limitInputPixels: MAX_PIXELS,
    failOn: "truncated",
    pages: 1,
  } as const;
  try {
    // rotate() with no angle applies the EXIF orientation before the
    // metadata is dropped. sharp writes no metadata unless asked to.
    const decoded = await sharp(bytes, options)
      .rotate()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const { width, height, channels } = decoded.info;
    const raw = { raw: { width, height, channels } } as const;
    const full = await sharp(decoded.data, raw)
      .resize({ width: FULL_WIDTH, withoutEnlargement: true })
      .webp({ quality: 86, effort: 5 })
      .toBuffer({ resolveWithObject: true });
    const thumb = await sharp(decoded.data, raw)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80, effort: 5 })
      .toBuffer();
    return {
      full: full.data,
      thumb,
      width: full.info.width,
      height: full.info.height,
    };
  } catch (err) {
    throw new ImageRejected(
      `the image does not decode: ${err instanceof Error ? err.message : err}`,
    );
  }
}

/**
 * Reads a response body up to MAX_BYTES and throws ImageRejected past that.
 * A Content-Length over the limit fails before any byte is read.
 */
export async function readCapped(
  response: Response,
  limit = MAX_BYTES,
): Promise<Uint8Array> {
  const declared = Number(response.headers.get("content-length"));
  if (declared > limit) {
    await response.body?.cancel();
    throw new ImageRejected(`the image is ${declared} bytes, over ${limit}`);
  }
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) {
      await reader.cancel();
      throw new ImageRejected(`the image is over ${limit} bytes`);
    }
    chunks.push(value);
  }
  const out = new Uint8Array(size);
  let at = 0;
  for (const chunk of chunks) {
    out.set(chunk, at);
    at += chunk.length;
  }
  return out;
}

/**
 * Downloads an image from an allowed GitHub URL. Each redirect is checked
 * against the allowed hosts before it is followed.
 */
export async function download(
  url: string,
  fetcher: typeof fetch = fetch,
): Promise<Uint8Array> {
  if (!isAllowedImageUrl(url)) {
    throw new ImageRejected("the image is not on a GitHub image host");
  }
  let current = url;
  for (let hop = 0; hop < 4; hop++) {
    const response = await fetcher(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(30_000),
      headers: { accept: "image/*" },
    });
    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel();
      const next = response.headers.get("location");
      if (!next) throw new ImageRejected("a redirect with no location");
      const target = new URL(next, current).toString();
      if (!isAllowedRedirect(target)) {
        throw new ImageRejected(
          `a redirect to ${new URL(target).hostname}, which is not allowed`,
        );
      }
      current = target;
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new ImageRejected(`the download answered ${response.status}`);
    }
    return readCapped(response);
  }
  throw new ImageRejected("too many redirects");
}
