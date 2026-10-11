import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { compareVersions, resolveSince, type SinceProps } from "./since";

describe("the generated versions", () => {
  // Facts from the tuios release notes, to catch a generator that drifts.
  test.each([
    [{ config: "keybindings.option_glyphs" }, "0.9.2"],
    [{ config: "keybindings.keyboard_layout" }, "0.9.2"],
    [{ command: "close-workspace" }, "0.8.3"],
    [{ command: "hosts sync" }, "0.9.0"],
    [{ command: "notify test" }, "0.9.0"],
    [{ verb: "subscribe" }, "0.8.0"],
  ] as [SinceProps, string][])("%o is %s", (props, version) => {
    expect(resolveSince(props)).toBe(version);
  });

  test("an unknown name throws", () => {
    expect(() => resolveSince({ config: "appearance.no_such_key" })).toThrow();
    expect(() => resolveSince({})).toThrow();
  });

  test("versions order by number, unreleased last", () => {
    expect(compareVersions("0.10.0", "0.9.2")).toBe(1);
    expect(compareVersions("0.9.2", "unreleased")).toBe(-1);
  });
});

describe("every badge in the content", () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".mdx")) files.push(full);
    }
  };
  walk(path.resolve("content"));

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const badges = [...text.matchAll(/<Since\b([^>]*?)\/>/g)];
    if (badges.length === 0) continue;
    test(path.relative(process.cwd(), file), () => {
      for (const [, attrs] of badges) {
        const props = Object.fromEntries(
          [...attrs.matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2]]),
        ) as SinceProps;
        // A bare badge would stay "Unreleased" after a release. Name a key.
        expect(Object.keys(props).length).toBeGreaterThan(0);
        expect(() => resolveSince(props)).not.toThrow();
      }
    });
  }
});
