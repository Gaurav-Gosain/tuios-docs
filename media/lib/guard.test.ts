import { describe, expect, test } from "bun:test";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// media/lib/guard.sh keeps the scene fixtures that rewrite a home folder
// (sshd.sh) inside the docs media container. These tests run on the host,
// where the guard must refuse. They call only the guard functions: a test
// that ran sshd.sh itself would destroy the real home if the guard broke.
const lib = path.resolve(import.meta.dir);
const guard = path.join(lib, "guard.sh");
const inContainer =
  existsSync("/.dockerenv") || existsSync("/run/.containerenv");

function bash(script: string) {
  const r = Bun.spawnSync(["bash", "-c", script], {
    stderr: "pipe",
    stdout: "pipe",
  });
  return { code: r.exitCode, err: r.stderr.toString() };
}

describe("guard.sh", () => {
  test.skipIf(inContainer)("refuses outside a container", () => {
    const r = bash(`source ${guard}; docs_media_guard sshd.sh; echo ran`);
    expect(r.code).toBe(1);
    expect(r.err).toContain("runs only in the docs media container");
  });

  test("refuses a home with no throwaway marker", () => {
    const home = mkdtempSync(path.join(tmpdir(), "guard-"));
    try {
      const r = bash(`source ${guard}; docs_media_guard_home ${home}`);
      expect(r.code).toBe(1);
      expect(r.err).toContain("has no .docs-media-throwaway file");
    } finally {
      rmSync(home, { recursive: true });
    }
  });

  test("lets a marked home through", () => {
    const home = mkdtempSync(path.join(tmpdir(), "guard-"));
    try {
      writeFileSync(path.join(home, ".docs-media-throwaway"), "");
      expect(bash(`source ${guard}; docs_media_guard_home ${home}`).code).toBe(
        0,
      );
    } finally {
      rmSync(home, { recursive: true });
    }
  });

  test("refuses the real home of this account", () => {
    const r = bash(
      `source ${guard}; docs_media_guard_home "$(getent passwd "$(id -u)" | cut -d: -f6)"`,
    );
    expect(r.code).toBe(1);
  });
});

describe("sshd.sh", () => {
  const lines = readFileSync(path.join(lib, "sshd.sh"), "utf8").split("\n");
  const code = lines
    .map((line, i) => ({ line: line.trim(), i }))
    .filter(({ line }) => line !== "" && !line.startsWith("#"));
  const at = (pred: (l: string) => boolean) =>
    code.find(({ line }) => pred(line))?.i ?? -1;

  test("checks the container before any other command", () => {
    expect(code[0].line).toBe("set -euo pipefail");
    expect(code[1].line).toContain("guard.sh");
    expect(code[2].line).toStartWith("docs_media_guard ");
  });

  test("checks the home right after it names it, before it writes there", () => {
    const named = at((l) => l.startsWith("remote="));
    const checked = at((l) => l.startsWith('docs_media_guard_home "$remote"'));
    expect(named).toBeGreaterThan(-1);
    expect(checked).toBe(code[code.findIndex(({ i }) => i === named) + 1].i);
    for (const step of [
      "mkdir",
      "rm ",
      "ssh-keygen",
      "pkill",
      "cat >",
      "cp ",
    ]) {
      const first = at((l) => l.startsWith(step));
      if (first > -1) expect(first).toBeGreaterThan(checked);
    }
  });
});
