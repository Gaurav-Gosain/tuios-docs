#!/usr/bin/env bun
/**
 * Writes lib/keybindings/defaults.json, the data behind the keybinding
 * explorer on /docs/keybindings, from tuios's own keybind report.
 *
 * The defaults differ by platform (opt+ on macOS, alt+ elsewhere), so the
 * script takes one report from each. Produce them with a fresh home, so no
 * user config leaks in:
 *
 *   h=$(mktemp -d)
 *   HOME=$h XDG_CONFIG_HOME=$h/c XDG_RUNTIME_DIR=$h \
 *     tuios keybinds doctor --json > darwin.json          # on macOS
 *   docker run --rm -v "$PWD":/w -e HOME=/tmp alpine \
 *     /w/tuios-linux keybinds doctor --json > linux.json  # a GOOS=linux build
 *
 *   bun scripts/keybindings.mjs darwin.json linux.json <tuios commit>
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const [darwinPath, linuxPath, ref] = process.argv.slice(2);
if (!darwinPath || !linuxPath || !ref) {
  console.error(
    "usage: bun scripts/keybindings.mjs <darwin.json> <linux.json> <tuios commit>",
  );
  process.exit(2);
}

const darwin = JSON.parse(readFileSync(darwinPath, "utf8"));
const linux = JSON.parse(readFileSync(linuxPath, "utf8"));

/** One row per scope and action, with every key that triggers it. */
function collect(report) {
  const rows = new Map();
  for (const b of report.bindings) {
    const id = `${b.scope} ${b.action}`;
    const row = rows.get(id) ?? {
      scope: b.scope,
      section: b.section,
      action: b.action,
      description: b.description,
      keys: [],
    };
    if (!row.keys.includes(b.press)) row.keys.push(b.press);
    rows.set(id, row);
  }
  return rows;
}

const d = collect(darwin);
const l = collect(linux);
const ids = [...new Set([...l.keys(), ...d.keys()])];

const bindings = ids.map((id) => {
  const base = l.get(id) ?? d.get(id);
  const macKeys = d.get(id)?.keys ?? [];
  const linuxKeys = l.get(id)?.keys ?? [];
  const same =
    macKeys.length === linuxKeys.length &&
    macKeys.every((k, i) => k === linuxKeys[i]);
  return {
    scope: base.scope,
    section: base.section,
    action: base.action,
    description: base.description,
    keys: linuxKeys,
    ...(same ? {} : { mac: macKeys }),
  };
});

const out = {
  source: `tuios keybinds doctor --json at ${ref}`,
  leader: linux.leader,
  bindings,
};

const target = new URL("../lib/keybindings/defaults.json", import.meta.url);
writeFileSync(target, `${JSON.stringify(out, null, 2)}\n`);
// Leave the file as Biome formats it, so bun run lint stays clean.
spawnSync("bunx", ["biome", "format", "--write", target.pathname], {
  stdio: "inherit",
});
console.log(`wrote ${bindings.length} actions to ${target.pathname}`);
