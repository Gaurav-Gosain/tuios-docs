import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { allBrandFiles, brandMarkdown, palette, termsText } from "./brand";

const publicDir = join(import.meta.dir, "..", "public");

/** Width and height from a PNG's IHDR chunk. */
function pngSize(path: string) {
  const data = readFileSync(path);
  return `${data.readUInt32BE(16)} x ${data.readUInt32BE(20)}`;
}

describe("brand kit", () => {
  const files = allBrandFiles();

  test("every listed file exists", () => {
    for (const file of files) {
      expect(existsSync(join(publicDir, file.path))).toBe(true);
    }
  });

  test("every PNG is the size the page says", () => {
    for (const file of files.filter((f) => f.format === "PNG")) {
      expect(`${file.path}: ${pngSize(join(publicDir, file.path))}`).toBe(
        `${file.path}: ${file.size}`,
      );
    }
  });

  test("every file in public/brand is listed", () => {
    const listed = new Set(files.map((file) => file.path));
    for (const name of readdirSync(join(publicDir, "brand"))) {
      expect(listed.has(`/brand/${name}`)).toBe(true);
    }
  });

  test("colours are six digit hex", () => {
    for (const group of palette) {
      for (const swatch of group.swatches) {
        expect(swatch.hex).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  test("the text has no em dashes", () => {
    expect(brandMarkdown()).not.toContain("—");
    expect(termsText()).not.toContain("—");
  });
});
