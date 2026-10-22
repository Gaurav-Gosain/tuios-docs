// Draws every ```mermaid block of the site with tuios.dev/sketch, ahead of
// the build:
//
//   bun run mermaid        (bun scripts/mermaid.mjs)
//
// It finds the blocks in content/ with the Markdown parser the site uses, so
// each block's source and id are the ones the page sees
// (lib/remark-sketch-mermaid.ts). Then tools/libshots/mermaid draws them with
// the sketch pinned in tools/libshots/go.mod and writes lib/mermaid.json: the
// SVG and the text drawing of each block. A block that sketch cannot draw
// stops it with the file and line.
//
// Run it after you add or change a block. The build fails on a block with no
// drawing, and names this command.
//
// Needs: Go.
import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { mermaidId } from "../lib/remark-sketch-mermaid.ts";

const root = path.resolve(import.meta.dirname, "..");

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (/\.mdx?$/.test(entry.name)) files.push(full);
  }
  return files;
}

const parser = unified().use(remarkParse).use(remarkMdx);
const blocks = [];
for (const file of (await walk(path.join(root, "content"))).sort()) {
  const tree = parser.parse(await readFile(file, "utf8"));
  visit(tree, "code", (node) => {
    if (node.lang !== "mermaid") return;
    blocks.push({
      id: mermaidId(node.value),
      source: node.value,
      where: `${path.relative(root, file)}:${node.position?.start.line ?? 0}`,
    });
  });
}

const run = spawnSync(
  "go",
  ["run", "./mermaid", "-out", path.join(root, "lib/mermaid.json")],
  {
    cwd: path.join(root, "tools/libshots"),
    env: { ...process.env, GOWORK: "off" },
    input: JSON.stringify(blocks),
    stdio: ["pipe", "inherit", "inherit"],
  },
);
process.exit(run.status ?? 1);
