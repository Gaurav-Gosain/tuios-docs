import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MAX_TEXT } from "./feed";
import {
  cleanText,
  firstCodeBlock,
  firstImageUrl,
  isAllowedImageUrl,
  isAllowedRedirect,
  normalizeImageUrl,
} from "./text";

const ATTACHMENT =
  "https://github.com/user-attachments/assets/b3b956c6-b635-4c8b-b1ff-38eb8926f626";

describe("isAllowedImageUrl", () => {
  const allowed = [
    ATTACHMENT,
    "https://private-user-images.githubusercontent.com/1/2-abc.png?jwt=x",
    "https://user-images.githubusercontent.com/1/2-abc.png",
  ];
  for (const url of allowed)
    test(`allowed: ${url}`, () => expect(isAllowedImageUrl(url)).toBe(true));

  const refused = [
    "http://github.com/user-attachments/assets/b3b956c6-b635-4c8b-b1ff-38eb8926f626",
    "https://github.com/user-attachments/files/123/evil.png",
    "https://github.com/Gaurav-Gosain/tuios/raw/main/x.png",
    "https://github.com.evil.com/user-attachments/assets/b3b956c6-b635",
    "https://evil.com/github.com/user-attachments/assets/b3b956c6-b635",
    "https://user-images.githubusercontent.com.evil.com/1.png",
    "https://evil-user-images.githubusercontent.com/1.png",
    "https://raw.githubusercontent.com/a/b/main/x.png",
    "https://user:pw@user-images.githubusercontent.com/1.png",
    "https://user-images.githubusercontent.com:8443/1.png",
    "https://user-images.githubusercontent.com/",
    "https://i.imgur.com/abc.png",
    "https://github-production-user-asset-6210df.s3.amazonaws.com/1/2.png",
    "data:image/png;base64,AAAA",
    "javascript:alert(1)",
    "//user-images.githubusercontent.com/1.png",
    "not a url",
  ];
  for (const url of refused)
    test(`refused: ${url}`, () => expect(isAllowedImageUrl(url)).toBe(false));
});

describe("isAllowedRedirect", () => {
  test("GitHub's S3 bucket", () =>
    expect(
      isAllowedRedirect(
        "https://github-production-user-asset-6210df.s3.amazonaws.com/1/2.png?X-Amz-Signature=x",
      ),
    ).toBe(true));
  test("another S3 bucket", () =>
    expect(isAllowedRedirect("https://evil.s3.amazonaws.com/x.png")).toBe(
      false,
    ));
  test("an S3 bucket named like GitHub's", () =>
    expect(
      isAllowedRedirect(
        "https://github-production-user-asset-0bad00.s3.amazonaws.com/1/2.png",
      ),
    ).toBe(false));
  test("another host", () =>
    expect(isAllowedRedirect("https://evil.com/x.png")).toBe(false));
});

describe("normalizeImageUrl", () => {
  test("drops the token", () =>
    expect(
      normalizeImageUrl(
        "https://private-user-images.githubusercontent.com/1/a.png?jwt=abc",
      ),
    ).toBe("https://private-user-images.githubusercontent.com/1/a.png"));
});

describe("firstImageUrl", () => {
  test("markdown image", () =>
    expect(firstImageUrl(`hi\n![setup](${ATTACHMENT})`)).toBe(ATTACHMENT));
  test("html image", () =>
    expect(
      firstImageUrl(`<img width="800" alt="x" src="${ATTACHMENT}" />`),
    ).toBe(ATTACHMENT));
  test("the first of two wins, even when it is refused later", () =>
    expect(
      firstImageUrl(`![a](https://evil.com/a.png)\n![b](${ATTACHMENT})`),
    ).toBe("https://evil.com/a.png"));
  test("an image inside a code block is not taken", () =>
    expect(
      firstImageUrl(
        `\`\`\`md\n![a](https://evil.com/a.png)\n\`\`\`\n![b](${ATTACHMENT})`,
      ),
    ).toBe(ATTACHMENT));
  test("an image inside a code span is not taken", () =>
    expect(
      firstImageUrl(`\`![a](https://evil.com/a.png)\` ![b](${ATTACHMENT})`),
    ).toBe(ATTACHMENT));
  test("no image", () => expect(firstImageUrl("just text")).toBeNull());
  test("a link is not an image", () =>
    expect(firstImageUrl(`[shot](${ATTACHMENT})`)).toBeNull());
});

describe("firstCodeBlock", () => {
  test("the first block and its language", () =>
    expect(
      firstCodeBlock(
        'my setup\n```toml\n[appearance]\ntheme = "nord"\n```\n```json\n{}\n```',
      ),
    ).toEqual({ label: "toml", text: '[appearance]\ntheme = "nord"' }));
  test("tilde fences", () =>
    expect(firstCodeBlock("~~~\na = 1\n~~~")).toEqual({
      label: "config",
      text: "a = 1",
    }));
  test("a longer fence holds a shorter one", () =>
    expect(firstCodeBlock("````\n```\nx\n```\n````")?.text).toBe(
      "```\nx\n```",
    ));
  test("an unclosed block runs to the end", () =>
    expect(firstCodeBlock("```\nx = 1")?.text).toBe("x = 1"));
  test("an odd info string becomes config", () =>
    expect(firstCodeBlock("```<script>alert(1)</script>\nx\n```")?.label).toBe(
      "config",
    ));
  test("an empty block is skipped", () =>
    expect(firstCodeBlock("```\n\n```\n```\ny\n```")?.text).toBe("y"));
  test("no block", () => expect(firstCodeBlock("no code here")).toBeNull());
  test("no Markdown or HTML is interpreted", () =>
    expect(
      firstCodeBlock("```\n<img src=x onerror=alert(1)> **b**\n```")?.text,
    ).toBe("<img src=x onerror=alert(1)> **b**"));
});

describe("cleanText", () => {
  test("strips CSI colour sequences", () =>
    expect(cleanText("\x1b[31mred\x1b[0m")).toBe("red"));
  test("strips OSC sequences, with BEL or ST", () => {
    expect(cleanText("\x1b]8;;https://evil.com\x07link\x1b]8;;\x07")).toBe(
      "link",
    );
    expect(cleanText("\x1b]0;title\x1b\\text")).toBe("text");
  });
  test("strips DCS", () => expect(cleanText("a\x1bPq#0;2\x1b\\b")).toBe("ab"));
  test("strips control characters but keeps newline and tab", () =>
    expect(cleanText("a\x00b\x07c\x08d\te\nf\r\ng\x7f\x9bh")).toBe(
      "abcd\te\nf\ngh",
    ));
  test("strips bidirectional overrides", () =>
    expect(cleanText("a‮b⁦c‏d")).toBe("abcd"));
  test("strips invisible characters that change a copied config", () =>
    expect(cleanText("a\u200bb\u2060c\u{e0041}\u{e0042}d\u061ce\u2028f")).toBe(
      "abcde\nf",
    ));
  test(`caps at ${MAX_TEXT} characters`, () =>
    expect(cleanText("x".repeat(MAX_TEXT * 3)).length).toBe(MAX_TEXT));
  test("does not split a surrogate pair at the cap", () => {
    const text = cleanText(`${"x".repeat(MAX_TEXT - 1)}\u{1F680}`);
    expect(text.length).toBe(MAX_TEXT - 1);
  });
  test("keeps ordinary unicode", () =>
    expect(cleanText("café ▤ ◆ 日本")).toBe("café ▤ ◆ 日本"));
});

describe("escaping", () => {
  // The page renders config text as a React text child. This is the proof
  // that markup in it reaches the HTML as text.
  test("markup in a config is escaped when rendered", () => {
    const block = firstCodeBlock(
      "```\n</pre><script>alert(1)</script><img src=x onerror=alert(1)>\n```",
    );
    const html = renderToStaticMarkup(createElement("pre", null, block?.text));
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
  });
});
