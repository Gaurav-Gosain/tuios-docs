import { describe, expect, test } from "bun:test";
import { pageKeysAllowed } from "./page-keys";

/** A stand-in for an element: its own selectors, its parent and attributes. */
function fake(
  matches: string[],
  parent: Element | null = null,
  attrs: string[] = [],
): Element {
  const el = {
    closest(selector: string): Element | null {
      const own = selector.split(",").some((s) => matches.includes(s.trim()));
      return own
        ? (el as unknown as Element)
        : (parent?.closest(selector) ?? null);
    },
    hasAttribute: (name: string) => attrs.includes(name),
  };
  return el as unknown as Element;
}

describe("pageKeysAllowed", () => {
  test("nothing focused, or a plain element, lets the page take keys", () => {
    expect(pageKeysAllowed(null)).toBe(true);
    expect(pageKeysAllowed(fake(["button"]))).toBe(true);
  });

  test("a field or the terminal textarea keeps the keys", () => {
    expect(pageKeysAllowed(fake(["input"]))).toBe(false);
    const stage = fake(["[role=application]"], null, ["data-left-by-keys"]);
    expect(pageKeysAllowed(fake(["textarea"], stage))).toBe(false);
  });

  test("a stage focused by a click keeps the keys", () => {
    expect(pageKeysAllowed(fake(["[role=application]"]))).toBe(false);
  });

  test("a stage left with esc three times lets the page take keys", () => {
    const stage = fake(["[role=application]"], null, ["data-left-by-keys"]);
    expect(pageKeysAllowed(stage)).toBe(true);
  });
});
