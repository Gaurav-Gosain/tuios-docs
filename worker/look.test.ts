import { describe, expect, test } from "bun:test";
import { lookRoute, serveLook } from "./look";
import type { MediaBucket } from "./media";

describe("lookRoute", () => {
  const cases: [string, unknown][] = [
    ["/r/123.toml", { kind: "bucket", key: "gallery/look/123.toml" }],
    ["/r/123", { kind: "card", id: "123" }],
    // Nothing else under /r/ is reachable, the old seed names included.
    ["/r/amber.toml", { kind: "missing" }],
    ["/r/amber", { kind: "missing" }],
    // Nothing else under /r/ is reachable.
    ["/r/../gallery/gallery.json", { kind: "missing" }],
    ["/r/%2e%2e/x.toml", { kind: "missing" }],
    ["/r/123.toml/x", { kind: "missing" }],
    ["/r/Amber.toml", { kind: "missing" }],
    ["/r/-x.toml", { kind: "missing" }],
    ["/r/1234567890123.toml", { kind: "missing" }],
    ["/r/a.b.toml", { kind: "missing" }],
    ["/r/", { kind: "missing" }],
    ["/gallery", null],
    ["/rx/123.toml", null],
  ];
  for (const [path, want] of cases)
    test(path, () => expect(lookRoute(path)).toEqual(want as never));
});

function env(objects: Record<string, string>) {
  const MEDIA = {
    async get(key: string) {
      const data = objects[key];
      return data === undefined
        ? null
        : { key, body: new Response(data).body, writeHttpMetadata() {} };
    },
    async head() {
      return null;
    },
  } as unknown as MediaBucket;
  return { MEDIA };
}

function route(path: string) {
  const r = lookRoute(path);
  if (!r) throw new Error(`${path} is not a look path`);
  return r;
}

describe("serveLook", () => {
  const e = env({ "gallery/look/123.toml": "look = 1\n" });

  test("a synced look is plain text from the bucket", async () => {
    const res = await serveLook(
      new Request("https://tuios.dev/r/123.toml"),
      route("/r/123.toml"),
      e,
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(await res.text()).toBe("look = 1\n");
  });

  test("a missing look is a 404", async () => {
    for (const path of ["/r/9.toml", "/r/../x"]) {
      const res = await serveLook(
        new Request(`https://tuios.dev${path}`),
        route(path),
        e,
      );
      expect(res.status).toBe(404);
    }
  });

  test("/r/<id> sends a browser to the card", async () => {
    const res = await serveLook(
      new Request("https://tuios.dev/r/123?x=1"),
      route("/r/123"),
      e,
    );
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "https://tuios.dev/gallery#look-123",
    );
  });

  test("only GET and HEAD", async () => {
    const res = await serveLook(
      new Request("https://tuios.dev/r/123.toml", { method: "POST" }),
      route("/r/123.toml"),
      e,
    );
    expect(res.status).toBe(405);
  });
});
