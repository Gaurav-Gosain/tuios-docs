import { describe, expect, test } from "bun:test";
import { formatRow, showBytes } from "./keydebug";

describe("the key log", () => {
  test("bytes read as text", () => {
    expect(showBytes("\x1bj")).toBe('"\\ej"');
    expect(showBytes("\x02")).toBe('"^B"');
    expect(showBytes("∆")).toBe('"∆(U+2206)"');
  });

  test("a key row says what the page did", () => {
    const line = formatRow(
      {
        id: 1,
        at: 12,
        kind: "dom",
        type: "keydown",
        key: "∆",
        code: "KeyJ",
        keyCode: 74,
        alt: true,
        target: "terminal",
        textarea: true,
        prevented: true,
        handler: "alt chord, sent by the page",
        sent: "\x1bj",
      },
      0,
    );
    expect(line).toContain('key="∆(U+2206)" code=KeyJ keyCode=74 mods=A----');
    expect(line).toContain("textarea=y prevented=y");
    expect(line).toContain('page: alt chord, sent by the page sent "\\ej"');
  });

  test("tuios and terminal rows", () => {
    expect(
      formatRow(
        { id: 2, at: 5, kind: "tuios", text: 't2 key "alt+j" mode=window' },
        0,
      ),
    ).toContain('tuios t2 key "alt+j" mode=window');
    expect(
      formatRow({ id: 3, at: 5, kind: "term", text: 't2 "\\e[106;3u"' }, 0),
    ).toContain('terminal t2 "\\e[106;3u" sent');
  });
});
