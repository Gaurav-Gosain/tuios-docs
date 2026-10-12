import { describe, expect, test } from "bun:test";
import { goImport, goImportMeta, libraryFor } from "./goimport";

describe("libraryFor", () => {
  const cases: [string, string | null][] = [
    ["/progstatus", "progstatus"],
    ["/progstatus/", "progstatus"],
    ["/progstatus/sub/pkg", "progstatus"],
    ["/progstatusx", null],
    ["/docs/progstatus", null],
    ["/", null],
    ["/constructor", null],
    ["/__proto__", null],
  ];
  for (const [path, want] of cases) {
    test(path, () => expect(libraryFor(path)).toBe(want));
  }
});

describe("goImport", () => {
  test("go-get=1 gets the meta tags with the folder", async () => {
    const res = goImport(
      new Request("https://tuios.dev/progstatus/sub?go-get=1"),
    );
    expect(res?.status).toBe(200);
    const body = (await res?.text()) ?? "";
    expect(body).toContain(
      '<meta name="go-import" content="tuios.dev/progstatus git https://github.com/Gaurav-Gosain/tuios progstatus">',
    );
    // The go command reads the head only, so the tag comes before <body>.
    expect(body.indexOf("go-import")).toBeLessThan(body.indexOf("<body>"));
  });

  test("a person is sent to the docs page", () => {
    const res = goImport(new Request("https://tuios.dev/progstatus?x=1"));
    expect(res?.status).toBe(302);
    expect(res?.headers.get("location")).toBe(
      "https://tuios.dev/docs/libraries/progstatus",
    );
  });

  test("other paths and methods pass through", () => {
    expect(goImport(new Request("https://tuios.dev/docs?go-get=1"))).toBe(null);
    expect(
      goImport(new Request("https://tuios.dev/progstatus", { method: "POST" })),
    ).toBe(null);
  });

  test("go-source names the folder for pkg.go.dev", () => {
    expect(goImportMeta("progstatus")).toContain(
      "https://github.com/Gaurav-Gosain/tuios/blob/main/progstatus{/dir}/{file}#L{line}",
    );
  });
});
