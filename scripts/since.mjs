#!/usr/bin/env bun
/**
 * Writes lib/since/data.json: the first tuios tag that has each config key,
 * CLI command, keybinding action, protocol verb and named feature. The
 * <Since /> badge reads it, so a page names a key instead of a version.
 *
 *   bun scripts/since.mjs <tuios checkout> [--ref origin/main] [--bin tuios]
 *
 * The items come from --ref (default origin/main). Each item gets the first
 * v* tag whose source has it, or "unreleased" when no tag does:
 *
 * - config keys: the dotted paths of the structs in internal/config, walked
 *   from UserConfig by their toml tags. A map is "*". A key is in a tag when
 *   the same walk of that tag's source reaches the same path.
 * - commands: the command tree of a tuios binary built from --ref, read with
 *   cobra's __complete, so hidden commands stay out. A command is in a tag
 *   when the file that declares it on --ref has its `Use:` there, or, for a
 *   name only one command uses, any file in cmd/tuios does.
 * - actions: the keys of ActionDescriptions and of the default bindings in
 *   internal/config. An action is in a tag when internal/config names it as
 *   a map key there.
 * - verbs: the verbs of internal/session/conn_scope.go. A verb is in a tag
 *   when internal/session has its name as a string there.
 * - features: lib/since/features.json, a probe string per feature for the
 *   things no key names, such as the seen state of mail.
 *
 * Run it again after each tuios release: the new tag turns "unreleased" into
 * that version. See AGENTS.md, "Version badges".
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const repo = args.find((a) => !a.startsWith("--"));
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
if (!repo) {
  console.error(
    "usage: bun scripts/since.mjs <tuios checkout> [--ref origin/main] [--bin tuios]",
  );
  process.exit(2);
}
const ref = flag("--ref") ?? "origin/main";
const outPath = path.resolve("lib/since/data.json");
const featuresPath = path.resolve("lib/since/features.json");

function git(...argv) {
  const r = spawnSync("git", ["-C", repo, ...argv], {
    encoding: "utf8",
    maxBuffer: 1 << 28,
  });
  if (r.status !== 0 && r.status !== 1) {
    throw new Error(`git ${argv.join(" ")}: ${r.stderr}`);
  }
  return r.stdout;
}

/** v0.9.2 and the like, oldest first. Pre-release tags are left out. */
const tags = git("tag", "-l", "v*")
  .split("\n")
  .filter((t) => /^v\d+\.\d+\.\d+$/.test(t))
  .sort((a, b) => {
    const pa = a.slice(1).split(".").map(Number);
    const pb = b.slice(1).split(".").map(Number);
    return pa[0] - pb[0] || pa[1] - pb[1] || pa[2] - pb[2];
  });
const sha = git("rev-parse", "--short=12", ref).trim();

/** The Go files of one folder at one revision, tests left out. */
function goFiles(rev, dir) {
  const listing = spawnSync(
    "git",
    ["-C", repo, "ls-tree", "--name-only", `${rev}:${dir}`],
    { encoding: "utf8" },
  );
  // A tag from before the folder existed has none of its files.
  if (listing.status !== 0) return [];
  const names = listing.stdout
    .split("\n")
    .filter((n) => n.endsWith(".go") && !n.endsWith("_test.go"));
  return names.map((n) => ({
    name: n,
    text: git("show", `${rev}:${dir}/${n}`),
  }));
}

// ---- config keys -----------------------------------------------------------

const FIELD =
  /^\s*([A-Z]\w*)\s+(.+?)\s*`[^`]*\btoml:"([^",]*)(?:,([^"]*))?"[^`]*`/;

/**
 * Struct types and their tagged fields. A field's type is a string, or for an
 * anonymous struct, the field list itself.
 */
function parseStructs(files) {
  const structs = new Map();
  for (const { text } of files) {
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const m = /^type (\w+) struct \{\s*$/.exec(lines[i]);
      if (!m) continue;
      const [fields, end] = parseBody(lines, i + 1);
      structs.set(m[1], fields);
      i = end;
    }
  }
  return structs;
}

function parseBody(lines, start) {
  const fields = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*\}/.test(line)) return [fields, i];
    const anon = /^\s*([A-Z]\w*)\s+(\*|\[\]|map\[string\])?struct \{\s*$/.exec(
      line,
    );
    if (anon) {
      const [inner, end] = parseBody(lines, i + 1);
      const tag = /toml:"([^",]*)/.exec(lines[end]);
      if (tag?.[1] && tag[1] !== "-") {
        fields.push({
          key: tag[1],
          type: inner,
          map: anon[2] === "map[string]",
        });
      }
      i = end;
      continue;
    }
    const f = FIELD.exec(line);
    if (f?.[3] && f[3] !== "-") {
      fields.push({ key: f[3], type: f[2] });
    }
  }
  return [fields, lines.length];
}

/** Every dotted path under UserConfig. */
function configPaths(structs) {
  const paths = new Set();
  const walk = (fields, prefix, seen) => {
    for (const field of fields) {
      let p = prefix ? `${prefix}.${field.key}` : field.key;
      if (Array.isArray(field.type)) {
        if (field.map) p += ".*";
        paths.add(p);
        walk(field.type, p, seen);
        continue;
      }
      let t = field.type.replace(/^\*/, "");
      while (true) {
        const map = /^map\[string\]\*?(.+)$/.exec(t);
        if (map) {
          p += ".*";
          t = map[1];
          continue;
        }
        const slice = /^\[\]\*?(.+)$/.exec(t);
        if (slice) {
          t = slice[1];
          continue;
        }
        break;
      }
      t = t.replace(/^\*/, "");
      paths.add(p);
      const inner = structs.get(t);
      if (inner && !seen.has(t) && p.split(".").length < 8) {
        walk(inner, p, new Set([...seen, t]));
      }
    }
  };
  const root = structs.get("UserConfig");
  if (root) walk(root, "", new Set(["UserConfig"]));
  return paths;
}

// ---- keybinding actions ----------------------------------------------------

function actionsOn(files) {
  const found = new Set();
  for (const { text } of files) {
    for (const m of text.matchAll(
      /^\s*"([a-z][a-z0-9_]+)":\s*(?:"|\{|\[\])/gm,
    )) {
      found.add(m[1]);
    }
  }
  return found;
}

/** The actions on --ref: ActionDescriptions and the default bindings. */
function refActions(files) {
  const found = new Set();
  for (const { name, text } of files) {
    if (name === "registry.go") {
      const start = text.indexOf("var ActionDescriptions = map[string]string{");
      const body = text.slice(start, text.indexOf("\n}\n", start));
      for (const m of body.matchAll(/^\s*"([a-z][a-z0-9_]+)":\s*"/gm)) {
        found.add(m[1]);
      }
    }
    if (name === "userconfig.go") {
      for (const m of text.matchAll(/^\s*"([a-z][a-z0-9_]+)":\s*\{"/gm)) {
        found.add(m[1]);
      }
    }
  }
  return found;
}

// ---- commands --------------------------------------------------------------

function usesOn(rev) {
  const out = git("grep", "-E", 'Use: +"[a-z0-9-]+', rev, "--", "cmd/tuios");
  const pairs = [];
  for (const line of out.split("\n")) {
    const m = /^[^:]+:cmd\/tuios\/([^:]+):.*Use: +"([a-z0-9-]+)/.exec(line);
    if (m && !m[1].endsWith("_test.go")) pairs.push({ file: m[1], leaf: m[2] });
  }
  return pairs;
}

function commandTree(bin) {
  const complete = (words) => {
    const r = spawnSync(bin, ["__complete", ...words, ""], {
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
    });
    return r.stdout
      .split("\n")
      .filter((l) => l && !l.startsWith(":"))
      .map((l) => l.split("\t")[0])
      .filter((w) => /^[a-z][a-z0-9-]*$/.test(w) && w !== "help");
  };
  // A command with no subcommands completes its arguments instead, such as
  // theme names. Only a name some `Use:` declares is a command.
  const declared = new Set(usesOn(ref).map((u) => u.leaf));
  const paths = [];
  const walk = (words) => {
    for (const name of complete(words)) {
      if (!declared.has(name)) continue;
      if (name === "completion" && words.length === 0) {
        paths.push(name);
        continue;
      }
      const next = [...words, name];
      paths.push(next.join(" "));
      if (next.length < 4) walk(next);
    }
  };
  walk([]);
  return paths;
}

// ---- verbs and features ----------------------------------------------------

function refVerbs() {
  const text = git("show", `${ref}:internal/session/conn_scope.go`);
  return [...text.matchAll(/^\s*"([a-z][a-z0-9-]+)":\s*scope[A-Z]\w*,/gm)].map(
    (m) => m[1],
  );
}

function stringsOn(rev, dir, list) {
  if (list.length === 0) return new Set();
  const argv = ["grep", "-h", "-o", "-F"];
  for (const s of list) argv.push("-e", s);
  argv.push(rev, "--", dir, ":!*_test.go");
  return new Set(
    git(...argv)
      .split("\n")
      .filter(Boolean),
  );
}

// ---- main ------------------------------------------------------------------

let bin = flag("--bin");
let built;
if (!bin) {
  built = mkdtempSync(path.join(tmpdir(), "tuios-since-"));
  const src = path.join(built, "src");
  spawnSync("git", ["-C", repo, "worktree", "add", "--detach", src, ref], {
    stdio: "inherit",
  });
  bin = path.join(built, "tuios");
  const r = spawnSync("go", ["build", "-o", bin, "./cmd/tuios"], {
    cwd: src,
    stdio: "inherit",
  });
  spawnSync("git", ["-C", repo, "worktree", "remove", "--force", src]);
  if (r.status !== 0) process.exit(1);
}

const refConfig = goFiles(ref, "internal/config");
const items = {
  config: [...configPaths(parseStructs(refConfig))].sort(),
  commands: commandTree(bin).sort(),
  actions: [...refActions(refConfig)].sort(),
  verbs: refVerbs().sort(),
};
if (built) rmSync(built, { recursive: true, force: true });
const features = JSON.parse(readFileSync(featuresPath, "utf8"));

// Where each command is declared on --ref, to follow it back through tags.
const refUses = usesOn(ref);
const leafCount = new Map();
for (const u of refUses)
  leafCount.set(u.leaf, (leafCount.get(u.leaf) ?? 0) + 1);
function declaringFile(command) {
  const words = command.split(" ");
  const leaf = words.at(-1);
  const files = refUses.filter((u) => u.leaf === leaf).map((u) => u.file);
  if (files.length <= 1) return files[0];
  const parents = words.slice(0, -1);
  return (
    files.find((f) => parents.some((p) => f.includes(p.replace(/-/g, "_")))) ??
    files.find((f) => words.length === 1 && f.startsWith(leaf)) ??
    files.find((f) => f === "main.go") ??
    files[0]
  );
}

const result = {
  config: {},
  commands: {},
  actions: {},
  verbs: {},
  features: {},
};
const pending = {
  config: new Set(items.config),
  commands: new Set(items.commands),
  actions: new Set(items.actions),
  verbs: new Set(items.verbs),
  features: new Set(Object.keys(features)),
};

for (const tag of tags) {
  const version = tag.slice(1);
  const cfg = goFiles(tag, "internal/config");
  const paths = configPaths(parseStructs(cfg));
  for (const p of [...pending.config]) {
    if (paths.has(p)) {
      result.config[p] = version;
      pending.config.delete(p);
    }
  }
  const actions = actionsOn(cfg);
  for (const a of [...pending.actions]) {
    if (actions.has(a)) {
      result.actions[a] = version;
      pending.actions.delete(a);
    }
  }
  const uses = usesOn(tag);
  for (const c of [...pending.commands]) {
    const leaf = c.split(" ").at(-1);
    const file = declaringFile(c);
    const here = uses.some((u) => u.leaf === leaf && u.file === file);
    const anywhere =
      leafCount.get(leaf) === 1 &&
      c.split(" ").length === 1 &&
      uses.some((u) => u.leaf === leaf);
    if (here || anywhere) {
      result.commands[c] = version;
      pending.commands.delete(c);
    }
  }
  const verbs = stringsOn(
    tag,
    "internal/session",
    [...pending.verbs].map((v) => `"${v}"`),
  );
  for (const v of [...pending.verbs]) {
    if (verbs.has(`"${v}"`)) {
      result.verbs[v] = version;
      pending.verbs.delete(v);
    }
  }
  for (const id of [...pending.features]) {
    const { probe, path: dir } = features[id];
    if (stringsOn(tag, dir, [probe]).size > 0) {
      result.features[id] = version;
      pending.features.delete(id);
    }
  }
}
for (const [kind, left] of Object.entries(pending)) {
  for (const id of left) result[kind][id] = "unreleased";
}

const sorted = (o) =>
  Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
const data = {
  source: `tuios ${ref} at ${sha}, tags ${tags[0]} to ${tags.at(-1)}`,
  latest: tags.at(-1).slice(1),
  config: sorted(result.config),
  commands: sorted(result.commands),
  actions: sorted(result.actions),
  verbs: sorted(result.verbs),
  features: sorted(result.features),
};
writeFileSync(outPath, `${JSON.stringify(data, null, 2)}\n`);
const count = (o) => Object.keys(o).length;
const unreleased = Object.values(result).reduce(
  (n, o) => n + Object.values(o).filter((v) => v === "unreleased").length,
  0,
);
console.log(
  `wrote ${outPath}: ${count(data.config)} config keys, ${count(data.commands)} commands, ${count(data.actions)} actions, ${count(data.verbs)} verbs, ${count(data.features)} features; ${unreleased} unreleased`,
);
