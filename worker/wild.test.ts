import { describe, expect, test } from "bun:test";
import { wildObject } from "./wild";

describe("wildObject", () => {
  const cases: [string, string | null][] = [
    ["/in-the-wild/feed", "mentions/featured.json"],
    // The page is a static asset, and no other key is reachable.
    ["/in-the-wild", null],
    ["/in-the-wild/feed/", null],
    ["/in-the-wild/mentions.json", null],
    ["/in-the-wild/feed/../state", null],
  ];
  for (const [path, key] of cases)
    test(path, () => expect(wildObject(path)?.key ?? null).toBe(key));
});
