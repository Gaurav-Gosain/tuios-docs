#!/usr/bin/env bun
/**
 * Writes lib/options/options.json, the data behind the option explorer on
 * /docs/config-options, from tuios's own option registry.
 *
 * `tuios list-options --json` needs a daemon, and it reports the values of
 * the config file it reads, so run it against a throwaway daemon in a fresh
 * home, never yours:
 *
 *   h=$(mktemp -d)
 *   HOME=$h XDG_CONFIG_HOME=$h/c XDG_RUNTIME_DIR=$h/r tuios daemon &
 *   HOME=$h XDG_CONFIG_HOME=$h/c XDG_RUNTIME_DIR=$h/r \
 *     tuios list-options --json > options.json
 *   bun scripts/options.mjs options.json <tuios commit>
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const [reportPath, ref] = process.argv.slice(2);
if (!reportPath || !ref) {
  console.error(
    "usage: bun scripts/options.mjs <list-options.json> <tuios commit>",
  );
  process.exit(2);
}

const report = JSON.parse(readFileSync(reportPath, "utf8"));
if (!Array.isArray(report.options) || report.options.length === 0) {
  console.error(`${reportPath}: no options in the report`);
  process.exit(1);
}

// Keep the fields the explorer shows, in one order, so a refresh diffs well.
const keep = [
  "path",
  "section",
  "type",
  "default",
  "accepted",
  "min",
  "max",
  "auto",
  "deprecated",
  "description",
];
const options = report.options
  .map((o) =>
    Object.fromEntries(
      keep.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]),
    ),
  )
  .sort(
    (a, b) =>
      a.section.localeCompare(b.section) || a.path.localeCompare(b.path),
  );

const out = { source: `tuios list-options --json at ${ref}`, options };
const target = new URL("../lib/options/options.json", import.meta.url);
writeFileSync(target, `${JSON.stringify(out, null, 2)}\n`);
// Leave the file as Biome formats it, so bun run lint stays clean.
spawnSync("bunx", ["biome", "format", "--write", target.pathname], {
  stdio: "inherit",
});
console.log(`wrote ${options.length} options to ${target.pathname}`);
