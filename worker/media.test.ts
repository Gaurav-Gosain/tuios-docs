import { describe, expect, test } from "bun:test";
import { type MediaBucket, mediaKey, resolveRange, serveMedia } from "./media";

describe("mediaKey", () => {
  const cases: [string, string | null][] = [
    ["/releases/v0.8.0/tiling.mp4", "releases/v0.8.0/tiling.mp4"],
    ["/releases/v0.8.0/tiling.webm", "releases/v0.8.0/tiling.webm"],
    [
      "/releases/v0.8.0/tiling-vertical.mp4",
      "releases/v0.8.0/tiling-vertical.mp4",
    ],
    // Posters and captions are static assets.
    ["/releases/v0.8.0/tiling.jpg", null],
    ["/releases/v0.8.0/tiling.vtt", null],
    // Pages are not media.
    ["/releases/v0-8-0", null],
    // Nothing outside a version folder, and no way out of one.
    ["/releases/tiling.mp4", null],
    ["/releases/v0.8.0/../secret.mp4", null],
    ["/releases/v0.8.0/sub/tiling.mp4", null],
    ["/releases/v0.8.0/.mp4", null],
    ["/demo.mp4", null],
  ];
  for (const [path, want] of cases) {
    test(path, () => expect(mediaKey(path)).toBe(want));
  }
});

describe("resolveRange", () => {
  test("offset and length", () =>
    expect(resolveRange({ offset: 10, length: 5 }, 100)).toEqual({
      offset: 10,
      length: 5,
    }));
  test("open ended", () =>
    expect(resolveRange({ offset: 90 }, 100)).toEqual({
      offset: 90,
      length: 10,
    }));
  test("length past the end is cut to the size", () =>
    expect(resolveRange({ offset: 90, length: 50 }, 100)).toEqual({
      offset: 90,
      length: 10,
    }));
  test("suffix", () =>
    expect(resolveRange({ suffix: 20 }, 100)).toEqual({
      offset: 80,
      length: 20,
    }));
  test("suffix longer than the file", () =>
    expect(resolveRange({ suffix: 500 }, 100)).toEqual({
      offset: 0,
      length: 100,
    }));
});

// A bucket holding one 100 byte object. It parses only the Range forms a
// video element sends: bytes=N- and bytes=N-M.
function fakeBucket(): MediaBucket {
  const size = 100;
  const meta = (range?: R2Range) =>
    ({
      size,
      httpEtag: '"abc"',
      range,
      writeHttpMetadata: (headers: Headers) =>
        headers.set("Content-Type", "video/mp4"),
    }) as unknown as R2Object;
  return {
    head: async (key: string) =>
      key === "releases/v0.8.0/a.mp4" ? meta() : null,
    get: (async (key: string, options?: R2GetOptions) => {
      if (key !== "releases/v0.8.0/a.mp4") return null;
      const headers = options?.onlyIf as Headers | undefined;
      if (headers?.get("if-none-match") === '"abc"') return meta();
      const raw = (options?.range as Headers | undefined)?.get("range");
      let range: R2Range | undefined;
      if (raw) {
        const [, start, end] = /bytes=(\d+)-(\d*)/.exec(raw) ?? [];
        const offset = Number(start);
        if (offset >= size) throw new Error("range not satisfiable");
        range = end ? { offset, length: Number(end) - offset + 1 } : { offset };
      }
      return { ...meta(range), body: new ReadableStream() };
    }) as MediaBucket["get"],
  };
}

const url = "https://tuios.dev/releases/v0.8.0/a.mp4";

describe("serveMedia", () => {
  test("a whole file", async () => {
    const res = await serveMedia(
      new Request(url),
      fakeBucket(),
      "releases/v0.8.0/a.mp4",
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-length")).toBe("100");
    expect(res.headers.get("accept-ranges")).toBe("bytes");
    expect(res.headers.get("content-type")).toBe("video/mp4");
  });

  test("a range", async () => {
    const req = new Request(url, { headers: { Range: "bytes=10-19" } });
    const res = await serveMedia(req, fakeBucket(), "releases/v0.8.0/a.mp4");
    expect(res.status).toBe(206);
    expect(res.headers.get("content-range")).toBe("bytes 10-19/100");
    expect(res.headers.get("content-length")).toBe("10");
  });

  test("an open range, as Safari first asks", async () => {
    const req = new Request(url, { headers: { Range: "bytes=0-" } });
    const res = await serveMedia(req, fakeBucket(), "releases/v0.8.0/a.mp4");
    expect(res.status).toBe(206);
    expect(res.headers.get("content-range")).toBe("bytes 0-99/100");
  });

  test("a range past the end", async () => {
    const req = new Request(url, { headers: { Range: "bytes=500-" } });
    const res = await serveMedia(req, fakeBucket(), "releases/v0.8.0/a.mp4");
    expect(res.status).toBe(416);
    expect(res.headers.get("content-range")).toBe("bytes */100");
  });

  test("a current copy", async () => {
    const req = new Request(url, { headers: { "If-None-Match": '"abc"' } });
    const res = await serveMedia(req, fakeBucket(), "releases/v0.8.0/a.mp4");
    expect(res.status).toBe(304);
  });

  test("HEAD", async () => {
    const req = new Request(url, { method: "HEAD" });
    const res = await serveMedia(req, fakeBucket(), "releases/v0.8.0/a.mp4");
    expect(res.status).toBe(200);
    expect(res.headers.get("etag")).toBe('"abc"');
  });

  test("a missing clip", async () => {
    const res = await serveMedia(
      new Request(url),
      fakeBucket(),
      "releases/v0.8.0/b.mp4",
    );
    expect(res.status).toBe(404);
  });

  test("POST", async () => {
    const req = new Request(url, { method: "POST" });
    const res = await serveMedia(req, fakeBucket(), "releases/v0.8.0/a.mp4");
    expect(res.status).toBe(405);
  });
});
