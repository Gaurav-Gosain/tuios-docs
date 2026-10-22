import { describe, expect, test } from "bun:test";
import { buildFs, complete, nearest, resolve, run } from "./shell";

const fs = buildFs([
  "/docs",
  "/docs/sessions",
  "/docs/themes",
  "/docs/libraries",
  "/docs/libraries/vt",
  "/blog",
  "/blog/hello",
  "/learn",
]);

describe("404 shell", () => {
  test("ls lists the real pages, directories marked", () => {
    const top = run(fs, "/", "ls").out[0].map((s) => s.t);
    expect(top).toEqual(["blog/", "docs/", "learn"]);
    const docs = run(fs, "/", "ls docs").out[0].map((s) => s.t);
    expect(run(fs, "/docs", "ls").out[0].map((s) => s.t)).toEqual(docs);
    expect(docs).toEqual(["libraries/", "sessions", "themes"]);
  });

  test("cd goes into a directory and opens a page", () => {
    expect(run(fs, "/", "cd docs").cwd).toBe("/docs");
    expect(run(fs, "/docs", "cd sessions").go).toBe("/docs/sessions");
    expect(run(fs, "/docs/libraries", "cd ../..").cwd).toBe("/");
    expect(run(fs, "/docs", "cd ~").cwd).toBe("/");
  });

  test("a missing page is an error with a suggestion", () => {
    const r = run(fs, "/docs", "cd sesions");
    expect(r.go).toBeUndefined();
    expect(r.out[0][0].c).toBe("err");
    expect(r.out[1].map((s) => s.t).join("")).toBe(
      "did you mean /docs/sessions",
    );
    expect(nearest(fs, "/zzzzzzzzz")).toBeNull();
  });

  test("open . opens the directory's own page", () => {
    expect(run(fs, "/docs", "open").go).toBe("/docs");
  });

  test("paths resolve like a shell", () => {
    expect(resolve("/docs", "../blog/./hello")).toBe("/blog/hello");
    expect(resolve("/docs", "/learn/")).toBe("/learn");
  });

  test("tab completes to the common prefix", () => {
    expect(complete(fs, "/", "cd do").line).toBe("cd docs/");
    expect(complete(fs, "/", "cd docs/li").line).toBe("cd docs/libraries/");
    expect(complete(fs, "/docs", "cd s").line).toBe("cd sessions");
    expect(complete(fs, "/", "cd x").line).toBe("cd x");
  });

  test("an ambiguous tab lists the matches", () => {
    const r = complete(fs, "/docs", "cd ");
    expect(r.options).toEqual(["libraries/", "sessions", "themes"]);
  });
});
