#!/usr/bin/env bun
/**
 * Writes lib/commands/commands.json, the data behind the command finder on
 * /docs/commands, from tuios's own command tree.
 *
 * `tuios help --json` needs no daemon and reads no config:
 *
 *   tuios help --json > help.json
 *   bun scripts/commands.mjs help.json <tuios commit>
 *
 * Each command keeps its path, usage line, short line, aliases and own flags.
 * `doc` links it to its section of content/docs/cli-reference.mdx: the
 * heading named by the longest part of its path, so `tuios task attach`
 * goes to the task section until it has a heading of its own.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const [reportPath, ref] = process.argv.slice(2);
if (!reportPath || !ref) {
  console.error("usage: bun scripts/commands.mjs <help.json> <tuios commit>");
  process.exit(2);
}

const report = JSON.parse(readFileSync(reportPath, "utf8"));
if (!Array.isArray(report.commands) || report.commands.length === 0) {
  console.error(`${reportPath}: no commands in the report`);
  process.exit(1);
}

/** The anchor Fumadocs gives a heading with no explicit id. */
function slug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

// Headings of the CLI reference: their text, without badges or code marks,
// and their anchor.
const page = new URL("../content/docs/cli-reference.mdx", import.meta.url);
// A command a table names, such as `tuios plugins install` under Plugins,
// goes to the section of its first mention.
const anchors = new Map();
const mentions = new Map();
let current = "";
for (const line of readFileSync(page, "utf8").split("\n")) {
  const m = line.match(/^#{2,4} (.+?)(?: \[#([^\]]+)\])?\s*$/);
  if (m) {
    const text = m[1]
      .replace(/<[^>]+\/>/g, "")
      .replace(/`/g, "")
      .replace(/^tuios /, "")
      .trim()
      .toLowerCase();
    current = m[2] ?? slug(text);
    if (!anchors.has(text)) anchors.set(text, current);
    continue;
  }
  if (!current) continue;
  for (const hit of line.matchAll(
    /`tuios ([a-z][a-z0-9-]*(?: [a-z][a-z0-9-]*)*)/g,
  )) {
    if (!mentions.has(hit[1])) mentions.set(hit[1], current);
  }
}

function docFor(path) {
  const words = path.split(" ").slice(1);
  for (const map of [anchors, mentions]) {
    for (let n = words.length; n > 0; n--) {
      const id = map.get(words.slice(0, n).join(" "));
      if (id) return `/docs/cli-reference#${id}`;
    }
  }
  return undefined;
}

const commands = report.commands
  .filter((c) => c.path !== "tuios")
  .map((c) => {
    const out = {
      path: c.path,
      use: c.use,
      short: c.short ?? "",
    };
    if (c.aliases?.length) out.aliases = c.aliases;
    const flags = (c.flags ?? []).map((f) => {
      const flag = { name: f.name, type: f.type, usage: f.usage ?? "" };
      if (f.shorthand) flag.short = f.shorthand;
      if (f.default && f.default !== "false" && f.default !== "[]") {
        flag.default = f.default;
      }
      return flag;
    });
    if (flags.length) out.flags = flags;
    const doc = docFor(c.path);
    if (doc) out.doc = doc;
    return out;
  })
  .sort((a, b) => a.path.localeCompare(b.path));

const target = new URL("../lib/commands/commands.json", import.meta.url);
writeFileSync(
  target,
  `${JSON.stringify({ source: `tuios help --json at ${ref}`, commands }, null, 2)}\n`,
);
spawnSync("bunx", ["biome", "format", "--write", target.pathname], {
  stdio: "inherit",
});
const linked = commands.filter((c) => c.doc).length;
console.log(
  `wrote ${commands.length} commands to ${target.pathname}, ${linked} linked to the CLI reference`,
);
