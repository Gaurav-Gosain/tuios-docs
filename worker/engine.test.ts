import { describe, expect, test } from "bun:test";
import { encodingQuality, engineWasm, serveEngineWasm } from "./engine";

describe("engineWasm", () => {
  const cases: [string, string | null][] = [
    ["/learn/engine/3103a9fcf896/tuios.wasm", "/learn/engine/3103a9fcf896/"],
    // The twins themselves are static assets.
    ["/learn/engine/3103a9fcf896/tuios.wasm.gz", null],
    ["/learn/engine/3103a9fcf896/tuios.wasm.br", null],
    // Nothing but a hash names the folder.
    ["/learn/engine/../tuios.wasm", null],
    ["/learn/engine/XYZ/tuios.wasm", null],
    ["/learn/engine/3103a9fcf896/sub/tuios.wasm", null],
    ["/tuios.wasm", null],
  ];
  for (const [path, want] of cases) {
    test(path, () => expect(engineWasm(path)).toBe(want));
  }
});

describe("encodingQuality", () => {
  test("listed codings", () => {
    expect(encodingQuality("gzip, deflate, br, zstd", "br")).toBe(1);
    expect(encodingQuality("gzip;q=0.8, br;q=0.5", "br")).toBe(0.5);
    expect(encodingQuality("gzip ;q=0.8, br ;q=0.5", "br")).toBe(0.5);
  });
  test("a refused or missing coding", () => {
    expect(encodingQuality("gzip, br;q=0", "br")).toBe(0);
    expect(encodingQuality("gzip", "br")).toBe(0);
    expect(encodingQuality(null, "gzip")).toBe(0);
  });
  test("the wildcard", () => {
    expect(encodingQuality("*", "br")).toBe(1);
    expect(encodingQuality("gzip, *;q=0", "br")).toBe(0);
  });
});

/** A fake assets binding with the given files, recording what it was asked. */
function fakeAssets(files: Record<string, string>) {
  const asked: Request[] = [];
  const fetcher = {
    async fetch(input: Request) {
      asked.push(input);
      const path = new URL(input.url).pathname;
      const body = files[path];
      if (body === undefined) return new Response("not found", { status: 404 });
      const etag = `"${path.length}"`;
      if (input.headers.get("if-none-match") === etag) {
        return new Response(null, { status: 304, headers: { ETag: etag } });
      }
      return new Response(input.method === "HEAD" ? null : body, {
        headers: {
          ETag: etag,
          "Content-Length": String(body.length),
          "Content-Type": "application/octet-stream",
        },
      });
    },
  };
  return { assets: fetcher as unknown as Fetcher, asked };
}

const folder = "/learn/engine/abc123/";
const url = `https://tuios.dev${folder}tuios.wasm`;
const both = {
  [`${folder}tuios.wasm.br`]: "BROTLI",
  [`${folder}tuios.wasm.gz`]: "GZIP",
};
const get = (
  acceptEncoding: string | null,
  extra: Record<string, string> = {},
) =>
  new Request(url, {
    headers: {
      ...(acceptEncoding === null ? {} : { "Accept-Encoding": acceptEncoding }),
      ...extra,
    },
  });

describe("serveEngineWasm", () => {
  test("brotli when the browser takes it", async () => {
    const { assets, asked } = fakeAssets(both);
    const res = await serveEngineWasm(get("gzip, deflate, br"), assets, folder);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-encoding")).toBe("br");
    expect(res.headers.get("content-type")).toBe("application/wasm");
    expect(res.headers.get("cache-control")).toBe(
      "public, max-age=31536000, immutable",
    );
    expect(res.headers.get("vary")).toBe("Accept-Encoding");
    expect(res.headers.get("content-length")).toBe("6");
    expect(await res.text()).toBe("BROTLI");
    // The twin is asked for as it is.
    expect(asked[0].headers.get("accept-encoding")).toBe("identity");
  });

  test("gzip when brotli is refused", async () => {
    const { assets } = fakeAssets(both);
    const res = await serveEngineWasm(get("gzip, br;q=0"), assets, folder);
    expect(res.headers.get("content-encoding")).toBe("gzip");
    expect(await res.text()).toBe("GZIP");
  });

  test("gzip when the engine has no brotli twin", async () => {
    const { assets } = fakeAssets({ [`${folder}tuios.wasm.gz`]: "GZIP" });
    const res = await serveEngineWasm(get("br, gzip"), assets, folder);
    expect(res.headers.get("content-encoding")).toBe("gzip");
    expect(await res.text()).toBe("GZIP");
  });

  test("406 when the browser takes neither", async () => {
    const { assets } = fakeAssets(both);
    for (const header of [null, "identity", "deflate"]) {
      const res = await serveEngineWasm(get(header), assets, folder);
      expect(res.status).toBe(406);
    }
  });

  test("404 from a missing engine is 406, so the page falls back", async () => {
    const { assets } = fakeAssets({});
    const res = await serveEngineWasm(get("br, gzip"), assets, folder);
    expect(res.status).toBe(406);
  });

  test("304 for a copy the browser holds", async () => {
    const { assets } = fakeAssets(both);
    const first = await serveEngineWasm(get("br"), assets, folder);
    const etag = first.headers.get("etag") ?? "";
    const again = await serveEngineWasm(
      get("br", { "If-None-Match": etag }),
      assets,
      folder,
    );
    expect(again.status).toBe(304);
    expect(again.headers.get("content-encoding")).toBe("br");
    expect(again.headers.get("vary")).toBe("Accept-Encoding");
  });

  test("HEAD has the headers and no body", async () => {
    const { assets } = fakeAssets(both);
    const res = await serveEngineWasm(
      new Request(url, {
        method: "HEAD",
        headers: { "Accept-Encoding": "br" },
      }),
      assets,
      folder,
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-encoding")).toBe("br");
    expect(await res.text()).toBe("");
  });

  test("the browser's own header, which Cloudflare keeps in cf", async () => {
    const { assets } = fakeAssets(both);
    // The edge shows the Worker "br, gzip" whatever the browser sent.
    const req = get("br, gzip");
    Object.defineProperty(req, "cf", {
      value: { clientAcceptEncoding: "gzip" },
    });
    const res = await serveEngineWasm(req, assets, folder);
    expect(res.headers.get("content-encoding")).toBe("gzip");
  });

  test("other methods", async () => {
    const { assets } = fakeAssets(both);
    const res = await serveEngineWasm(
      new Request(url, { method: "POST" }),
      assets,
      folder,
    );
    expect(res.status).toBe(405);
  });
});
