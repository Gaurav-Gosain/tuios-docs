import { describe, expect, test } from "bun:test";
import { movedTo } from "./moved";

describe("movedTo", () => {
  const cases: [string, string | null][] = [
    ["/releases/since-v0-7-0", "/releases/v0-8-0"],
    ["/releases/since-v0-7-0/", "/releases/v0-8-0"],
    ["/releases/since-v0-7-0.html", "/releases/v0-8-0"],
    ["/releases/since-v0-7-0.md", "/releases/v0-8-0.md"],
    ["/releases/v0-8-0", null],
    ["/releases/v0-8-0.md", null],
    ["/releases", null],
    ["/", null],
    ["/releases/since-v0-7-0-extra", null],
  ];
  for (const [path, want] of cases) {
    test(path, () => {
      expect(movedTo(path)).toBe(want);
    });
  }
});
