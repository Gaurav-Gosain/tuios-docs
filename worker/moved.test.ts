import { describe, expect, test } from "bun:test";
import { movedTo } from "./moved";

describe("movedTo", () => {
  const cases: [string, string | null][] = [
    ["/releases/since-v0-7-0", "/releases/v0-8-0"],
    ["/releases/since-v0-7-0/", "/releases/v0-8-0"],
    ["/releases/since-v0-7-0.html", "/releases/v0-8-0"],
    ["/releases/since-v0-7-0.md", "/releases/v0-8-0.md"],
    ["/releases/v0-8-0", null],
    ["/docs/whats-new", "/docs"],
    ["/docs/whats-new/", "/docs"],
    ["/docs/whats-new.md", "/docs.md"],
    ["/docs/upgrading-to-v0-13-0", "/docs"],
    ["/docs/upgrading-to-v0-13-0.html", "/docs"],
    ["/docs/upgrading-to-v0-13-0.md", "/docs.md"],
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
