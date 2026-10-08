import { describe, expect, test } from "bun:test";
import worker from "./index";
import { prefixRangeEnd } from "./range";

// A page the way the export writes it: doctype, then the build id comment
// that Next's prefetch reads, then a large body.
const BUILD_ID = "<!DOCTYPE html><!--k7Qx2mVb9LrT0pWcYz1aE-->";
const PAGE = `${BUILD_ID}<html>${"<p>tuios</p>".repeat(80_000)}</html>`;
const PAGE_BYTES = new TextEncoder().encode(PAGE).length;

/**
 * Stands in for Workers static assets, which ignore Range: every page comes
 * back 200 with its whole body, in chunks like a real stream.
 */
function fakeAssets(): Fetcher {
  return {
    async fetch(input: RequestInfo | URL, init?: RequestInit) {
      const req = new Request(input, init);
      const path = new URL(req.url).pathname;
      if (path === "/docs/configuration") {
        const bytes = new TextEncoder().encode(PAGE);
        const body = new ReadableStream<Uint8Array>({
          start(controller) {
            for (let i = 0; i < bytes.length; i += 4096) {
              controller.enqueue(bytes.subarray(i, i + 4096));
            }
            controller.close();
          },
        });
        return new Response(req.method === "HEAD" ? null : body, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Content-Length": String(bytes.length),
          },
        });
      }
      if (path === "/docs/short") {
        return new Response(req.method === "HEAD" ? null : BUILD_ID, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
      if (path === "/docs/configuration.md") {
        return new Response(req.method === "HEAD" ? null : "# Configuration", {
          headers: { "Content-Type": "text/markdown" },
        });
      }
      return new Response("Not found", { status: 404 });
    },
    connect() {
      throw new Error("not used");
    },
  } as unknown as Fetcher;
}

function get(headers: Record<string, string>, method = "GET") {
  const request = new Request("https://tuios.dev/docs/configuration", {
    method,
    headers,
  });
  return worker.fetch(request, { ASSETS: fakeAssets() });
}

describe("Next's prefetch range", () => {
  test("bytes=0-63 gets 206 with the first 64 bytes", async () => {
    const res = await get({ Range: "bytes=0-63" });
    expect(res.status).toBe(206);
    expect(res.headers.get("content-range")).toBe(`bytes 0-63/${PAGE_BYTES}`);
    expect(res.headers.get("content-length")).toBe("64");
    const body = new Uint8Array(await res.arrayBuffer());
    expect(body.length).toBe(64);
    // What Next checks: the slice starts with the doctype and build id.
    expect(new TextDecoder().decode(body).startsWith(BUILD_ID)).toBe(true);
    // The page headers survive.
    expect(res.headers.get("vary")).toContain("Accept");
    expect(res.headers.get("link")).toContain("/docs/configuration.md");
  });

  test("a range longer than a short page gets the whole page as 206", async () => {
    const request = new Request("https://tuios.dev/docs/short", {
      headers: { Range: "bytes=0-1023" },
    });
    const res = await worker.fetch(request, { ASSETS: fakeAssets() });
    expect(res.status).toBe(206);
    const n = new TextEncoder().encode(BUILD_ID).length;
    expect(res.headers.get("content-range")).toBe(`bytes 0-${n - 1}/${n}`);
    expect(await res.text()).toBe(BUILD_ID);
  });

  test("a range over 64 KiB is left to the assets", async () => {
    const res = await get({ Range: "bytes=0-65536" });
    expect(res.status).toBe(200);
    expect((await res.arrayBuffer()).byteLength).toBe(PAGE_BYTES);
  });

  test("no Range gets 200 with the whole page", async () => {
    const res = await get({});
    expect(res.status).toBe(200);
    expect((await res.arrayBuffer()).byteLength).toBe(PAGE_BYTES);
  });

  const passThrough: [string, Record<string, string>, string?][] = [
    ["a range that starts past 0", { Range: "bytes=64-127" }],
    ["a suffix range", { Range: "bytes=-64" }],
    ["an open range", { Range: "bytes=0-" }],
    ["two ranges", { Range: "bytes=0-63, 100-200" }],
    ["If-Range", { Range: "bytes=0-63", "If-Range": '"abc"' }],
    ["HEAD", { Range: "bytes=0-63" }, "HEAD"],
  ];
  for (const [name, headers, method] of passThrough) {
    test(`${name} is left to the assets`, async () => {
      const res = await get(headers, method);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-range")).toBeNull();
    });
  }

  test("the markdown twin is not sliced", async () => {
    const res = await get({ Range: "bytes=0-63", Accept: "text/markdown" });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("# Configuration");
  });

  test("a missing page keeps its 404", async () => {
    const request = new Request("https://tuios.dev/docs/nope", {
      headers: { Range: "bytes=0-63" },
    });
    const res = await worker.fetch(request, { ASSETS: fakeAssets() });
    expect(res.status).toBe(404);
  });
});

describe("prefixRangeEnd", () => {
  test.each([
    ["bytes=0-63", 63],
    ["bytes=0-0", 0],
    [" bytes = 0 - 63 ", 63],
    ["BYTES=0-63", 63],
    ["bytes=1-63", null],
    ["bytes=0-", null],
    ["bytes=-63", null],
    ["bytes=0-63,64-127", null],
    ["items=0-63", null],
    ["", null],
  ] as [string, number | null][])("%s", (header, want) => {
    expect(prefixRangeEnd(header)).toBe(want);
  });

  test("no header", () => {
    expect(prefixRangeEnd(null)).toBeNull();
  });
});
