import { describe, expect, test } from "bun:test";
import { deflateSync } from "node:zlib";
import sharp from "sharp";
import {
  checkHeader,
  download,
  ImageRejected,
  MAX_BYTES,
  readCapped,
  readHeader,
  reencode,
} from "./image";

const ATTACHMENT =
  "https://github.com/user-attachments/assets/b3b956c6-b635-4c8b-b1ff-38eb8926f626";

function solid(width: number, height: number) {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 200, g: 120, b: 40 },
    },
  });
}

/** A CRC-32 for the PNG chunks the bomb is built from. */
function crc32(bytes: Uint8Array) {
  let c = ~0;
  for (const b of bytes) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type: string, data: Uint8Array) {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out.set(new TextEncoder().encode(type), 4);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

/**
 * A real decompression bomb: a grey PNG whose pixel data is all zeros, so
 * 36 megapixels compress to a few tens of kilobytes.
 */
function pngBomb(width: number, height: number) {
  const ihdr = new Uint8Array(13);
  const v = new DataView(ihdr.buffer);
  v.setUint32(0, width);
  v.setUint32(4, height);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 0; // greyscale
  const raw = new Uint8Array((width + 1) * height); // filter byte + row, zeros
  const idat = deflateSync(raw, { level: 9 });
  const parts = [
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", new Uint8Array()),
  ];
  return Buffer.concat(parts);
}

describe("readHeader", () => {
  test("png, jpeg, gif and webp report their size", async () => {
    for (const format of ["png", "jpeg", "gif", "webp"] as const) {
      const bytes = await solid(321, 123).toFormat(format).toBuffer();
      expect(readHeader(bytes)).toEqual({
        type: format,
        width: 321,
        height: 123,
      });
    }
  });
  test("lossless webp", async () => {
    const bytes = await solid(77, 55).webp({ lossless: true }).toBuffer();
    expect(readHeader(bytes)).toEqual({ type: "webp", width: 77, height: 55 });
  });
  test("svg, html and random bytes are not images", () => {
    for (const text of [
      '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
      "<html><script>alert(1)</script></html>",
      "\x00\x01\x02\x03 random bytes and more bytes to be long enough",
    ]) {
      expect(readHeader(new TextEncoder().encode(text))).toBeNull();
    }
  });
});

describe("checkHeader", () => {
  test("the decompression bomb is refused from its header", () => {
    const bomb = pngBomb(6000, 6000);
    expect(bomb.length).toBeLessThan(200_000);
    expect(() => checkHeader(bomb)).toThrow(/megapixels/);
  });
  test("a header that claims a huge size is refused", () => {
    const bytes = pngBomb(10, 10);
    new DataView(bytes.buffer, bytes.byteOffset).setUint32(16, 0x7fffffff);
    expect(() => checkHeader(bytes)).toThrow(ImageRejected);
  });
  test("exactly 25 megapixels passes, one row more does not", () => {
    expect(checkHeader(pngBomb(5000, 5000)).width).toBe(5000);
    expect(() => checkHeader(pngBomb(5000, 5001))).toThrow(/megapixels/);
  });
});

describe("reencode", () => {
  test("a wide image becomes 1600 px and an 800 px thumbnail, both WebP", async () => {
    const out = await reencode(await solid(3200, 400).png().toBuffer());
    expect(out.width).toBe(1600);
    expect(out.height).toBe(200);
    expect(readHeader(out.full)).toEqual({
      type: "webp",
      width: 1600,
      height: 200,
    });
    expect(readHeader(out.thumb)).toEqual({
      type: "webp",
      width: 800,
      height: 100,
    });
  });
  test("a small image is not enlarged", async () => {
    const out = await reencode(await solid(500, 300).jpeg().toBuffer());
    expect([out.width, out.height]).toEqual([500, 300]);
    expect(readHeader(out.thumb)?.width).toBe(500);
  });
  test("EXIF and GPS are gone", async () => {
    const withGps = await solid(400, 300)
      .withExif({
        IFD0: { Make: "SecretCam", Artist: "home address" },
        IFD3: { GPSLatitudeRef: "N", GPSLatitude: "51/1 30/1 0/1" },
      })
      .jpeg()
      .toBuffer();
    expect((await sharp(withGps).metadata()).exif).toBeDefined();
    const out = await reencode(withGps);
    for (const file of [out.full, out.thumb]) {
      const meta = await sharp(file).metadata();
      expect(meta.exif).toBeUndefined();
      expect(meta.xmp).toBeUndefined();
      expect(meta.icc).toBeUndefined();
      expect(file.includes("SecretCam")).toBe(false);
    }
  });
  test("data appended after the image (a polyglot) is gone", async () => {
    const payload = "<script>alert('polyglot')</script>PK\x03\x04";
    const png = Buffer.concat([
      await solid(64, 64).png().toBuffer(),
      Buffer.from(payload),
    ]);
    const out = await reencode(png);
    expect(out.full.includes("polyglot")).toBe(false);
    expect(out.thumb.includes("polyglot")).toBe(false);
  });
  test("the decompression bomb is refused before it is decoded", async () => {
    await expect(reencode(pngBomb(6000, 6000))).rejects.toThrow(/megapixels/);
  });
  test("a truncated image is refused", async () => {
    const png = await solid(400, 400).png({ compressionLevel: 0 }).toBuffer();
    await expect(reencode(png.subarray(0, png.length / 2))).rejects.toThrow(
      /does not decode/,
    );
  });
  test("bytes that are not an image are refused", async () => {
    await expect(
      reencode(new TextEncoder().encode("<svg><script/></svg>")),
    ).rejects.toThrow(ImageRejected);
  });
  test("more than 10 MB is refused", async () => {
    const big = new Uint8Array(MAX_BYTES + 1);
    await expect(reencode(big)).rejects.toThrow(/bytes/);
  });
});

describe("readCapped", () => {
  test("a Content-Length over the cap fails before reading", async () => {
    const response = new Response("small", {
      headers: { "content-length": String(MAX_BYTES + 1) },
    });
    await expect(readCapped(response)).rejects.toThrow(ImageRejected);
  });
  test("a body over the cap with no length fails while reading", async () => {
    let sent = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        sent += 1 << 20;
        controller.enqueue(new Uint8Array(1 << 20));
        if (sent > 64 << 20) controller.close();
      },
    });
    await expect(readCapped(new Response(stream))).rejects.toThrow(/over/);
    // It stopped at the cap, not at the end of the stream.
    expect(sent).toBeLessThan(MAX_BYTES + (4 << 20));
  });
  test("a body under the cap is returned", async () => {
    const bytes = await readCapped(new Response(new Uint8Array(1000)));
    expect(bytes.length).toBe(1000);
  });
});

describe("download", () => {
  const redirect = (to: string) =>
    new Response(null, { status: 302, headers: { location: to } });

  test("a URL off GitHub is not fetched", async () => {
    let called = false;
    const fetcher = (async () => {
      called = true;
      return new Response("x");
    }) as unknown as typeof fetch;
    await expect(download("https://evil.com/a.png", fetcher)).rejects.toThrow(
      /GitHub image host/,
    );
    expect(called).toBe(false);
  });
  test("a redirect to GitHub's S3 bucket is followed", async () => {
    const seen: string[] = [];
    const fetcher = (async (url: string) => {
      seen.push(url);
      return seen.length === 1
        ? redirect(
            "https://github-production-user-asset-6210df.s3.amazonaws.com/1/2.png?sig=x",
          )
        : new Response(new Uint8Array([1, 2, 3]));
    }) as unknown as typeof fetch;
    expect((await download(ATTACHMENT, fetcher)).length).toBe(3);
    expect(seen).toHaveLength(2);
  });
  test("a redirect anywhere else is refused", async () => {
    for (const to of [
      "https://evil.com/a.png",
      "http://github-production-user-asset-6210df.s3.amazonaws.com/1.png",
      "https://169.254.169.254/latest/meta-data",
    ]) {
      const seen: string[] = [];
      const fetcher = (async (url: string) => {
        seen.push(url);
        return redirect(to);
      }) as unknown as typeof fetch;
      await expect(download(ATTACHMENT, fetcher)).rejects.toThrow(
        /not allowed/,
      );
      // The foreign host is never fetched.
      expect(seen).toEqual([ATTACHMENT]);
    }
  });
  test("a redirect loop stops", async () => {
    const fetcher = (async () =>
      redirect(ATTACHMENT)) as unknown as typeof fetch;
    await expect(download(ATTACHMENT, fetcher)).rejects.toThrow(/too many/);
  });
});
