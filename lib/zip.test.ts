import { describe, expect, test } from "bun:test";
import { inflateRawSync } from "node:zlib";
import { crc32, zip } from "./zip";

/** Reads an archive back through its central directory. */
function unzip(archive: Uint8Array) {
  const view = new DataView(archive.buffer, archive.byteOffset);
  const end = archive.length - 22;
  expect(view.getUint32(end, true)).toBe(0x06054b50);
  const count = view.getUint16(end + 10, true);
  let at = view.getUint32(end + 16, true);
  const files: Record<string, Uint8Array> = {};
  for (let i = 0; i < count; i++) {
    expect(view.getUint32(at, true)).toBe(0x02014b50);
    const method = view.getUint16(at + 10, true);
    const crc = view.getUint32(at + 16, true);
    const size = view.getUint32(at + 20, true);
    const nameLength = view.getUint16(at + 28, true);
    const local = view.getUint32(at + 42, true);
    const name = new TextDecoder().decode(
      archive.subarray(at + 46, at + 46 + nameLength),
    );
    expect(view.getUint32(local, true)).toBe(0x04034b50);
    const start = local + 30 + view.getUint16(local + 26, true);
    const body = archive.subarray(start, start + size);
    const data = method === 8 ? new Uint8Array(inflateRawSync(body)) : body;
    expect(crc32(data)).toBe(crc);
    files[name] = data;
    at += 46 + nameLength;
  }
  return files;
}

describe("zip", () => {
  test("crc32 matches the standard check value", () => {
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  });

  test("round trips text and binary entries", () => {
    const text = new TextEncoder().encode("tuios ".repeat(200));
    const noise = new Uint8Array(512).map((_, i) => (i * 7919) % 251);
    const archive = zip([
      { name: "terms.txt", data: text },
      { name: "png/noise.bin", data: noise },
    ]);
    const files = unzip(archive);
    expect(Object.keys(files)).toEqual(["terms.txt", "png/noise.bin"]);
    expect(files["terms.txt"]).toEqual(text);
    expect(files["png/noise.bin"]).toEqual(noise);
  });

  test("the same entries give the same bytes", () => {
    const entries = [{ name: "a.txt", data: new TextEncoder().encode("a") }];
    expect(zip(entries)).toEqual(zip(entries));
  });
});
