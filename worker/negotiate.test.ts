import { describe, expect, test } from "bun:test";
import {
  appendVary,
  isPagePath,
  markdownPath,
  preferredType,
  quality,
} from "./negotiate";

describe("preferredType", () => {
  const cases: [string | null, string | null][] = [
    [null, "text/html"],
    ["", "text/html"],
    ["*/*", "text/html"],
    ["text/html", "text/html"],
    ["text/markdown", "text/markdown"],
    ["text/markdown, text/html", "text/markdown"],
    ["text/html, text/markdown", "text/html"],
    ["text/html;q=0.5, text/markdown", "text/markdown"],
    ["text/markdown;q=0.5, text/html;q=0.9", "text/html"],
    ["text/*", "text/html"],
    // The most specific range decides: markdown is refused outright.
    ["text/*, text/markdown;q=0", "text/html"],
    ["text/markdown, text/*;q=0.1", "text/markdown"],
    ["text/markdown, */*;q=0.8", "text/markdown"],
    // A typical browser prefers HTML.
    ["text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "text/html"],
    ["application/pdf", null],
    ["text/html;q=0, text/markdown;q=0", null],
    ["TEXT/MARKDOWN", "text/markdown"],
    ["garbage", "text/html"],
  ];
  for (const [header, want] of cases) {
    test(String(header), () => {
      expect(preferredType(header)).toBe(want);
    });
  }
});

describe("quality", () => {
  test.each([
    [null, "text/html", 1],
    ["text/markdown", "text/html", 0],
    ["text/markdown, text/*;q=0.3", "text/html", 0.3],
    ["text/markdown, */*;q=0.1", "text/html", 0.1],
    ["text/html;q=0", "text/html", 0],
    ["text/*, text/markdown;q=0", "text/markdown", 0],
  ])("%s for %s", (header, type, want) => {
    expect(quality(header, type)).toBe(want);
  });
});

describe("markdownPath", () => {
  test.each([
    ["/", "/index.md"],
    ["/docs", "/docs.md"],
    ["/docs/", "/docs.md"],
    ["/docs/sessions", "/docs/sessions.md"],
    ["/docs/sessions.html", "/docs/sessions.md"],
  ])("%s", (path, want) => {
    expect(markdownPath(path)).toBe(want);
  });
});

describe("isPagePath", () => {
  test.each([
    ["/", true],
    ["/docs/sessions", true],
    ["/docs/sessions.html", true],
    ["/docs/sessions.md", false],
    ["/fonts/MonaspaceNeon-1.400.woff2", false],
    ["/sitemap.xml", false],
  ])("%s", (path, want) => {
    expect(isPagePath(path)).toBe(want);
  });
});

describe("appendVary", () => {
  test.each([
    [null, "Accept"],
    ["Accept-Encoding", "Accept-Encoding, Accept"],
    ["accept", "accept"],
    ["*", "*"],
  ])("%s", (existing, want) => {
    expect(appendVary(existing)).toBe(want);
  });
});
