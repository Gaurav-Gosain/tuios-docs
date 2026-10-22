import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// public/_redirects is answered by Workers static assets, not by the Worker,
// so these checks read the file itself. A redirect to a shot that is gone
// would turn an old link into a redirect to a 404, and a rule for a file that
// still exists would hide that file.
const publicDir = path.resolve(import.meta.dir, "../public");
const rules = readFileSync(path.join(publicDir, "_redirects"), "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line !== "" && !line.startsWith("#"))
  .map((line) => line.split(/\s+/));

describe("old -800 shot names", () => {
  const shotRules = rules.filter(([from]) => from.startsWith("/shots/"));

  test("are listed", () => {
    expect(shotRules.length).toBeGreaterThan(0);
  });

  for (const [from, to, status] of shotRules) {
    test(from, () => {
      expect(from).toMatch(/^\/shots\/[a-z0-9-]+-800\.webp$/);
      expect(to).toBe(from.replace(/-800\.webp$/, ".webp"));
      expect(status).toBe("301");
      expect(existsSync(path.join(publicDir, to))).toBe(true);
      expect(existsSync(path.join(publicDir, from))).toBe(false);
    });
  }
});
