// Writes the reference pages of the docs from the tuios repository, so the
// site and the repo cannot say two things about one topic:
//
//   content/docs/cli-reference.mdx     from docs/CLI_REFERENCE.md
//   content/docs/configuration.mdx     from docs/CONFIGURATION.md
//   content/docs/keybindings.mdx       from docs/KEYBINDINGS.md
//   content/docs/option-reference.mdx  from docs/config-options.md
//   content/docs/default-keys.mdx      from docs/keybindings-defaults.md
//   content/docs/control-protocol.mdx  from docs/protocol.md
//   content/docs/protocol-verbs.mdx    from docs/protocol-verbs.md
//
//   bun scripts/reference-docs.mjs <tuios checkout> <ref>
//
// scripts/reference-data.sh runs it, at the commit in reference/TUIOS_REF.
// Do not edit the pages by hand: change the doc in tuios and move the pin.
//
// The markdown goes through remark and comes out as MDX, so a < or a { in the
// text is escaped and never read as JSX. On the way:
//
// - The title becomes frontmatter, and a table of contents is dropped (the
//   site has its own), as is the do-not-edit note of a generated doc.
// - Every heading keeps the anchor GitHub gives it, so a link that works in the
//   repo works here. A heading that names a command or a verb gets its <Since>
//   badge.
// - A link to one of these docs goes to its page. A link to any other file in
//   the repo goes to that file on GitHub at the pinned commit.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { toString as textOf } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const REPO = "https://github.com/Gaurav-Gosain/tuios";
const SITE = "https://tuios.dev";

// Each page: the repo doc it renders, its frontmatter, and an optional block
// of site MDX placed before the first section (a widget that reads the same
// pinned data).
export const pages = [
  {
    slug: "cli-reference",
    source: "docs/CLI_REFERENCE.md",
    title: "CLI Reference",
    description:
      "Every tuios command and flag, with examples. Sessions, windows, input and output, agents, remote hosts, tapes, environment variables and exit codes.",
    icon: "Terminal",
    lead: "To search every command by name or flag, use the [command finder](/docs/commands).",
  },
  {
    slug: "configuration",
    source: "docs/CONFIGURATION.md",
    title: "Configuration",
    description:
      "Every table and option in the TUIOS config.toml, with defaults and how changes apply.",
    icon: "Settings",
    lead: "To search every option by name, type or value, use the [option explorer](/docs/config-options).",
  },
  {
    slug: "option-reference",
    source: "docs/config-options.md",
    title: "Option Reference",
    description:
      "Every option of the TUIOS config.toml with its type, default and description, written from the option registry.",
    icon: "SlidersHorizontal",
    lead: "To filter the options by name, type or value, use the [option explorer](/docs/config-options).",
  },
  {
    slug: "keybindings",
    source: "docs/KEYBINDINGS.md",
    title: "Keybindings",
    description:
      "Every default key in TUIOS for window mode, terminal mode, prefix commands, copy mode and the mouse, and how to change them.",
    icon: "Keyboard",
    lead: "**Try it live:** [Learn tuios](/learn) has you press these keys in the real app, in your browser. [Default keys](/docs/default-keys) lists every default key, with a search.",
  },
  {
    slug: "default-keys",
    source: "docs/keybindings-defaults.md",
    title: "Default Keys",
    description:
      "Every default key of TUIOS, by the part of the app it works in, written from the keymaps in the code.",
    icon: "Keyboard",
    lead: [
      "Search every default binding. **Compare with my config** takes your `config.toml` and shows your keys over the defaults. It stays in your browser.",
      "",
      "<KeybindingExplorer />",
    ].join("\n"),
  },
  {
    slug: "control-protocol",
    source: "docs/protocol.md",
    title: "Control Protocol",
    description:
      "Drive a TUIOS daemon from scripts and programs with line-delimited JSON on its socket.",
    icon: "Terminal",
  },
  {
    slug: "protocol-verbs",
    source: "docs/protocol-verbs.md",
    title: "Protocol Verbs",
    description:
      "Every verb of the TUIOS control protocol, with its arguments, its reply and an example.",
    icon: "Braces",
  },
];

const pageOf = new Map(pages.map((p) => [p.source, `/docs/${p.slug}`]));

async function since() {
  const data = JSON.parse(
    await readFile(new URL("../lib/since/data.json", import.meta.url), "utf8"),
  );
  return { commands: data.commands, verbs: data.verbs };
}

// The badge for a heading such as `tuios worktree new` or `list-sessions`.
function badgeFor(text, source, known) {
  const code = text.match(/^`?([^`]+)`?$/)?.[1]?.trim();
  if (!code) return undefined;
  if (source === "docs/protocol-verbs.md") {
    return known.verbs[code] ? { name: "verb", value: code } : undefined;
  }
  const cmd = code.match(/^tuios ([a-z][a-z0-9-]*(?: [a-z][a-z0-9-]*)*)/)?.[1];
  return cmd && known.commands[cmd]
    ? { name: "command", value: cmd }
    : undefined;
}

function rewriteUrl(url, source, ref) {
  if (url.startsWith(SITE)) return url.slice(SITE.length) || "/";
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("#")) return url;
  const [file, hash] = url.split("#");
  const target = path.posix.normalize(
    path.posix.join(path.posix.dirname(source), file),
  );
  const anchor = hash ? `#${hash}` : "";
  const page = pageOf.get(target);
  if (page) return page + anchor;
  if (target.startsWith("..")) return url;
  return `${REPO}/blob/${ref}/${target}${anchor}`;
}

// The raw HTML in the repo docs is plain tags such as <kbd> and <details>,
// which MDX reads as JSX once they are closed. A comment is dropped, and <br>
// is closed. A tag HTML does not have, such as <version> in prose, is a
// placeholder the doc meant as text, so it stays text.
const HTML_TAGS = new Set([
  "a",
  "b",
  "br",
  "code",
  "details",
  "em",
  "i",
  "img",
  "kbd",
  "p",
  "pre",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
]);

function fixHtml(node) {
  const value = node.value.trim();
  if (/^<!--[\s\S]*-->$/.test(value)) return null;
  const tag = value.match(/^<\/?([a-zA-Z][a-zA-Z0-9-]*)/)?.[1];
  if (!tag || !HTML_TAGS.has(tag.toLowerCase())) {
    return { type: "text", value: node.value };
  }
  return { ...node, value: node.value.replace(/<br\s*>/gi, "<br />") };
}

export async function render(page, src, ref, known) {
  const md = await readFile(path.join(src, page.source), "utf8");
  const tree = unified().use(remarkParse).use(remarkGfm).parse(md);

  // Drop the title and a table of contents.
  const kept = [];
  let skip = 0;
  for (const node of tree.children) {
    if (node.type === "heading") {
      if (skip && node.depth <= skip) skip = 0;
      if (node.depth === 1) continue;
      if (/^(table of )?contents$/i.test(textOf(node).trim())) {
        skip = node.depth;
        continue;
      }
    }
    // A generated doc opens with a note for the people who change tuios:
    // do not edit, and how to write the file again. A reader of the site
    // has no use for it.
    if (
      node.type === "paragraph" &&
      textOf(node).startsWith("Do not edit this file by hand.")
    )
      continue;
    if (!skip) kept.push(node);
  }
  tree.children = kept;

  const slugger = new GithubSlugger();
  visit(tree, (node, index, parent) => {
    if (node.type === "heading") {
      const text = textOf(node).trim();
      const id = slugger.slug(text);
      const badge = badgeFor(text, page.source, known);
      if (badge) {
        node.children.push(
          { type: "text", value: " " },
          {
            type: "mdxJsxTextElement",
            name: "Since",
            attributes: [
              { type: "mdxJsxAttribute", name: badge.name, value: badge.value },
            ],
            children: [],
          },
        );
      }
      node.children.push({ type: "text", value: ` [#${id}]` });
    }
    if (node.type === "link" || node.type === "definition") {
      node.url = rewriteUrl(node.url, page.source, ref);
    }
    if (node.type === "image") {
      node.url = rewriteUrl(node.url, page.source, ref).replace(
        "/blob/",
        "/raw/",
      );
    }
    if (node.type === "html" && parent) {
      const fixed = fixHtml(node);
      if (fixed === null) {
        parent.children.splice(index, 1);
        return index;
      }
      parent.children[index] = fixed;
    }
  });

  const body = unified()
    .use(remarkGfm)
    .use(remarkMdx)
    .use(remarkStringify, { bullet: "-", emphasis: "_", rule: "-" })
    .stringify(tree);

  // remark-stringify escapes the bracket of a heading id, "\\[#id]". Fumadocs
  // reads the id either way, and scripts/commands.mjs reads it unescaped.
  const bodyOut = body.replace(/^(#{1,6} .*) \\\[#([\w.-]+)\]$/gm, "$1 [#$2]");

  const front = [
    "---",
    `title: ${JSON.stringify(page.title)}`,
    `description: ${JSON.stringify(page.description)}`,
    `icon: ${page.icon}`,
    "---",
    "",
    'import { Since } from "@/components/mdx/since";',
    "",
    `{/* Written by scripts/reference-docs.mjs from tuios ${page.source} at ${ref}. Do not edit: change the doc in tuios and move reference/TUIOS_REF. */}`,
    "",
    `This page is ${"`"}${page.source}${"`"} of the [tuios repository](${REPO}/blob/${ref}/${page.source}), at the version this site documents.`,
    "",
  ];
  if (page.lead) front.push(page.lead, "");
  return `${front.join("\n")}\n${bodyOut}`;
}

if (import.meta.main) {
  const [src, ref] = process.argv.slice(2);
  if (!src || !ref) {
    console.error(
      "usage: bun scripts/reference-docs.mjs <tuios checkout> <ref>",
    );
    process.exit(2);
  }
  const known = await since();
  const site = new URL("..", import.meta.url).pathname;
  for (const page of pages) {
    const out = path.join(site, "content/docs", `${page.slug}.mdx`);
    await writeFile(out, await render(page, src, ref, known));
    console.log(`wrote content/docs/${page.slug}.mdx from ${page.source}`);
  }
}
