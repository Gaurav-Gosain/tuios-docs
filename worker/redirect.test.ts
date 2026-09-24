import { describe, expect, test } from "bun:test";
import { site } from "../lib/site";
import worker from "./index";
import { canonicalOrigin, hostRedirect, redirectHosts } from "./redirect";

// Every kind of path the site serves. A redirect that skipped any of them
// would break old links of that kind.
const paths = [
  "/",
  "/docs",
  "/docs/sessions",
  "/docs/sessions/",
  "/docs/sessions.md",
  "/docs/sessions.txt",
  "/docs/sessions.html",
  "/blog",
  "/blog/a-pty-has-one-size",
  "/blog/rss.xml",
  "/blog/atom.xml",
  "/releases",
  "/releases/rss.xml",
  "/releases/atom.xml",
  "/learn",
  "/learn/",
  "/learn/engine.json",
  "/learn/engine/0123abcd/tuios.wasm.gz",
  "/learn/tilly.svg",
  "/og/site/image.png",
  "/og/learn/image.png",
  "/og/docs/sessions/image.png",
  "/llms.txt",
  "/llms-full.txt",
  "/sitemap.xml",
  "/robots.txt",
  "/api/search",
  "/md-export.json",
  "/googlec29e65255957551c.html",
  "/fonts/some-font.woff2",
  "/demo.mp4",
  "/does/not/exist",
  "/path%20with%20spaces",
];

const queries = ["", "?q=sessions", "?a=1&b=two&a=3", "?utm_source=x&empty="];

/** An ASSETS binding that fails the test if the Worker reaches it. */
const noAssets = {
  ASSETS: {
    fetch() {
      throw new Error("a moved host must not reach the assets");
    },
  } as unknown as Fetcher,
};

describe("canonical origin", () => {
  test("is https://tuios.dev and matches the site config", () => {
    expect(canonicalOrigin).toBe("https://tuios.dev");
    expect(site.url).toBe("https://tuios.dev");
  });

  test("is not itself a redirect host", () => {
    expect(redirectHosts.has(new URL(canonicalOrigin).hostname)).toBe(false);
  });
});

describe("hostRedirect", () => {
  for (const host of ["tuios.gaurav.zip", "www.tuios.dev"]) {
    for (const scheme of ["https", "http"]) {
      for (const path of paths) {
        for (const query of queries) {
          const from = `${scheme}://${host}${path}${query}`;
          test(from, () => {
            for (const method of ["GET", "HEAD"]) {
              const res = hostRedirect(new Request(from, { method }));
              expect(res).not.toBeNull();
              expect(res?.status).toBe(301);
              expect(res?.headers.get("location")).toBe(
                `https://tuios.dev${path}${query}`,
              );
            }
          });
        }
      }
    }
  }

  test("ignores the case of the host", () => {
    const res = hostRedirect(new Request("https://TUIOS.Gaurav.ZIP/docs?x=1"));
    expect(res?.status).toBe(301);
    expect(res?.headers.get("location")).toBe("https://tuios.dev/docs?x=1");
  });

  test("redirects methods other than GET and HEAD too", () => {
    const res = hostRedirect(
      new Request("https://tuios.gaurav.zip/api/search", { method: "POST" }),
    );
    expect(res?.status).toBe(301);
    expect(res?.headers.get("location")).toBe("https://tuios.dev/api/search");
  });

  test("drops the fragment, which a client never sends", () => {
    const res = hostRedirect(
      new Request("https://tuios.gaurav.zip/docs/sessions?x=1#detach"),
    );
    expect(res?.headers.get("location")).toBe(
      "https://tuios.dev/docs/sessions?x=1",
    );
  });

  test("has no body", async () => {
    const res = hostRedirect(new Request("https://tuios.gaurav.zip/"));
    expect(await res?.text()).toBe("");
  });

  test("sends plain http on the canonical host to https", () => {
    for (const method of ["GET", "HEAD"]) {
      const res = hostRedirect(
        new Request("http://tuios.dev/docs/sessions.md?q=1", { method }),
      );
      expect(res?.status).toBe(301);
      expect(res?.headers.get("location")).toBe(
        "https://tuios.dev/docs/sessions.md?q=1",
      );
    }
  });

  for (const url of [
    "https://tuios.dev/",
    "https://tuios.dev/docs?q=1",
    "http://localhost:8787/learn",
    "http://127.0.0.1:8787/",
    "https://gaurav.zip/",
    "https://other.gaurav.zip/",
  ]) {
    test(`serves ${url} directly`, () => {
      expect(hostRedirect(new Request(url))).toBeNull();
    });
  }
});

describe("worker", () => {
  // The redirect runs before content negotiation and before the assets, so
  // it applies whatever the Accept header says.
  for (const accept of [
    null,
    "text/html",
    "text/markdown",
    "application/pdf",
  ]) {
    for (const method of ["GET", "HEAD"]) {
      test(`${method} with Accept ${accept} on the old host`, async () => {
        const headers: Record<string, string> = {};
        if (accept) headers.accept = accept;
        const res = await worker.fetch(
          new Request("https://tuios.gaurav.zip/docs/sessions?from=old", {
            method,
            headers,
          }),
          noAssets,
        );
        expect(res.status).toBe(301);
        expect(res.headers.get("location")).toBe(
          "https://tuios.dev/docs/sessions?from=old",
        );
      });
    }
  }

  test("serves the canonical host from the assets", async () => {
    const seen: string[] = [];
    const env = {
      ASSETS: {
        async fetch(input: Request | string) {
          const req = input instanceof Request ? input : new Request(input);
          seen.push(new URL(req.url).pathname);
          return new Response("x", {
            status: 200,
            headers: { "content-type": "image/png" },
          });
        },
      } as unknown as Fetcher,
    };
    const res = await worker.fetch(
      new Request("https://tuios.dev/og/site/image.png"),
      env,
    );
    expect(res.status).toBe(200);
    expect(seen).toEqual(["/og/site/image.png"]);
  });
});
