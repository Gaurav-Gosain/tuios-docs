// Writes the reference pages of the docs from the tuios repository, so the
// site and the repo cannot say two things about one topic:
//
//   content/docs/cli-reference/        from docs/CLI_REFERENCE.md
//   content/docs/configuration.mdx     from docs/CONFIGURATION.md
//   content/docs/keybindings.mdx       from docs/KEYBINDINGS.md
//   content/docs/option-reference.mdx  from docs/config-options.md
//   content/docs/default-keys.mdx      from docs/keybindings-defaults.md
//   content/docs/control-protocol/     from docs/protocol.md
//   content/docs/protocol-verbs/       from docs/protocol-verbs.md
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
//
// A doc too large for one page is split into a folder (see `split` below):
// an index page at the old URL, and one page per section or verb topic. A
// heading keeps its anchor on the page it moves to.
// lib/reference/anchors.json maps each moved anchor to its page, so a link to
// the old URL with that anchor still lands (components/mdx/anchor-redirect.tsx)
// and scripts/commands.mjs links each command to the right page.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
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
// pinned data). A group of a split page can have a lead of its own, such as a
// screenshot of what the page is about.
export const pages = [
  {
    slug: "cli-reference",
    source: "docs/CLI_REFERENCE.md",
    title: "CLI Reference",
    description:
      "Every tuios command and flag, with examples. Sessions, windows, input and output, agents, remote hosts, tapes, environment variables and exit codes.",
    icon: "Terminal",
    lead: "To search every command by name or flag, use the [command finder](/docs/commands).",
    // The general sections stay on the index. Each command group gets a page.
    split: {
      index: [
        "overview",
        "installation",
        "usage",
        "commands",
        "theming",
        "agent-skill",
        "global-flags",
        "common-usage-examples",
        "environment-variables",
        "when-something-goes-wrong",
        "exit-codes",
        "version-information",
        "command-migration-guide",
        "related-documentation",
      ],
      names: {
        "daemon-mode-session-persistence": "daemon-mode",
        "tuios-web-separate-binary": "tuios-web",
      },
      budget: 100_000,
    },
  },
  {
    slug: "configuration",
    source: "docs/CONFIGURATION.md",
    title: "Configuration",
    description:
      "Every table and option in the TUIOS config.toml, with defaults and how changes apply.",
    icon: "Settings",
    lead: "To search every option by name, type or value, use the [option explorer](/docs/config-options).",
    split: {
      index: [
        "tables",
        "applying-changes",
        "validation",
        "when-a-key-is-wrong",
        "troubleshooting",
        "examples",
      ],
      groups: [
        {
          start: "sidebar-file-editor",
          slug: "files-input-and-focus",
          title: "Files, input and focus",
        },
        {
          start: "animation-speed",
          slug: "motion-rendering-and-themes",
          title: "Motion, rendering and themes",
        },
        {
          start: "graphical-programs-from-the-launcher",
          slug: "workspaces-and-windows",
          title: "Workspaces and windows",
        },
        {
          start: "limits-and-banners",
          slug: "display-mouse-and-shell",
          title: "Display, mouse and shell",
        },
        {
          start: "the-docks-components",
          slug: "dock-and-rail",
          title: "The dock and the session rail",
        },
        { start: "turn-off-agent-features", slug: "agents", title: "Agents" },
        {
          start: "what-a-pane-may-do",
          slug: "permissions",
          title: "Permissions and other machines",
        },
        {
          start: "appearance-the-appearance-table",
          slug: "appearance-tables",
          title: "The appearance tables",
        },
        {
          start: "keybindings-the-keybindings-table",
          slug: "other-tables",
          title: "The other tables",
        },
      ],
      budget: 90_000,
    },
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
    lead: [
      "**Try it live:** [Learn tuios](/learn) has you press these keys in the real app, in your browser. [Default keys](/docs/default-keys) lists every default key, with a search.",
      "",
      '<Shot\n  name="keybinds-cheatsheet"\n  light\n  framed\n  width={2038}\n  height={1710}\n  alt="tuios keybinds cheatsheet tmux lists the tmux keys that work the same after Ctrl+B, such as Ctrl+B % to split left and right and Ctrl+B z to zoom."\n/>',
    ].join("\n"),
    split: {
      index: [
        "keys-of-another-multiplexer",
        "lock-mode",
        "nest-mode",
        "the-full-list",
        "keybind-presets",
        "palette-commands-you-can-bind",
        "customizing",
      ],
      groups: [
        {
          start: "editing-sidebar-files",
          slug: "panes-panels-and-workspaces",
          title: "Panes, panels and workspaces",
          lead: '<Shot\n  name="scratch-terminal"\n  light\n  framed\n  width={2208}\n  height={1488}\n  alt="The scratch terminal: a box of one pane over the layout, with git status in it. The panes of the layout stay behind the box."\n/>',
        },
        {
          start: "copy-mode",
          slug: "copy-mode",
          title: "Copy mode and screenshots",
          lead: '<Shot\n  name="copy-mode-search"\n  light\n  framed\n  width={2038}\n  height={1340}\n  alt="Copy mode in a pane with git log --stat, searched for store. Each match is marked, the current match stands out, and the dock shows the match count."\n/>',
        },
        {
          start: "the-agents-view",
          slug: "agents-view",
          title: "The agents view",
          lead: '<Shot\n  name="agents-view-keys"\n  light\n  framed\n  width={2208}\n  height={1710}\n  alt="The help over the agents view, at its Agents section. It lists the keys that open the agents view, jump to the oldest item that needs you, review a pane\'s changes, and act on an agent row of the rail."\n/>',
        },
        {
          start: "other-keyboard-layouts",
          slug: "layouts-and-macos",
          title: "Keyboard layouts and macOS",
          lead: '<Shot\n  name="keys-layout"\n  light\n  framed\n  width={2038}\n  height={1192}\n  alt="tuios keybinds explain reads opt+shift+7 as alt+shift+7, move to workspace 7. It reads opt+& the same way on a US layout, and names the setting for other layouts."\n/>',
        },
        {
          start: "modes",
          slug: "keys-by-mode",
          title: "Keys by mode",
          lead: '<Shot\n  name="keys-explain"\n  light\n  framed\n  width={2038}\n  height={1340}\n  alt="tuios keybinds explain q lists what q does in each mode: quit in window mode, close in the agents view and the mailbox, and in terminal mode the pane gets it. tuios keybinds explain ctrl+b says the pane never gets the leader key, and which programs want it."\n/>',
        },
      ],
      budget: 90_000,
    },
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
    // The verbs section gets a page per verb topic, named by the "Verbs by
    // topic" section of this doc.
    split: {
      index: [
        "transport-and-framing",
        "connecting",
        "request-envelope",
        "response-envelope",
        "calling-a-verb-from-a-command",
        "verbs-by-topic",
        "examples",
        "error-codes",
        "how-verbs-interact-with-an-attached-client",
        "herdr-compatibility",
        "a-client-built-on-these-verbs-the-tmux-shim",
        "examples-from-a-shell",
      ],
      names: { "versioning-and-introspection": "versioning" },
      byTopic: { verbs: { prefix: "verbs-", title: "Verbs: " } },
      budget: 120_000,
    },
  },
  {
    slug: "protocol-verbs",
    source: "docs/protocol-verbs.md",
    title: "Protocol Verbs",
    description:
      "Every verb of the TUIOS control protocol, with its arguments, its reply and an example.",
    icon: "Braces",
    split: {
      index: [],
      byTopic: { verbs: { prefix: "", title: "" } },
      budget: 300_000,
    },
  },
];

const pageOf = new Map(pages.map((p) => [p.source, p.slug]));

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

// Where an anchor of a page went: anchors.get(slug).get(id) is the path of
// the part that holds it. A page that is not split is all one part.
function pathOf(anchors, slug, id) {
  return anchors.get(slug)?.get(id) ?? `/docs/${slug}`;
}

// A site path such as /docs/cli-reference#tuios-run, moved to the part that
// holds the anchor. Other URLs come back as they are.
export function remapDocs(url, anchors) {
  const m = url.match(/^\/docs\/([\w-]+)#([\w.-]+)$/);
  if (!m || !anchors.has(m[1])) return url;
  return `${pathOf(anchors, m[1], m[2])}#${m[2]}`;
}

function rewriteUrl(url, source, ref, ctx) {
  if (url.startsWith(SITE))
    return remapDocs(url.slice(SITE.length) || "/", ctx.anchors);
  if (url.startsWith("#")) {
    const at = pathOf(ctx.anchors, ctx.slug, url.slice(1));
    return at === ctx.path ? url : at + url;
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
  if (url.startsWith("/")) return remapDocs(url, ctx.anchors);
  const [file, hash] = url.split("#");
  const target = path.posix.normalize(
    path.posix.join(path.posix.dirname(source), file),
  );
  const anchor = hash ? `#${hash}` : "";
  const slug = pageOf.get(target);
  if (slug) {
    return (hash ? pathOf(ctx.anchors, slug, hash) : `/docs/${slug}`) + anchor;
  }
  if (target.startsWith("..")) return url;
  return `${REPO}/blob/${ref}/${target}${anchor}`;
}

// Reads a doc: drops the title, a table of contents and the do-not-edit note,
// and gives each heading the anchor GitHub gives it (node.data.id).
async function parse(page, src) {
  const md = await readFile(path.join(src, page.source), "utf8");
  const tree = unified().use(remarkParse).use(remarkGfm).parse(md);
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
  visit(tree, "heading", (node) => {
    node.data = { ...node.data, id: slugger.slug(textOf(node).trim()) };
  });
  return { md, tree };
}

// The size of some nodes in the markdown source, in bytes.
function sizeOf(nodes) {
  return nodes.reduce(
    (n, node) => n + (node.position.end.offset - node.position.start.offset),
    0,
  );
}

// Cuts a list of nodes at each heading of the given depth. The nodes before
// the first such heading are the head.
function cut(nodes, depth) {
  const head = [];
  const parts = [];
  for (const node of nodes) {
    if (node.type === "heading" && node.depth === depth) parts.push([node]);
    else if (parts.length) parts.at(-1).push(node);
    else head.push(node);
  }
  return { head, parts };
}

// The verb topics of protocol.md: each "Verbs by topic" heading, with the
// verbs its links name. A verb no topic names goes to "other-verbs".
function topicsOf(tree) {
  const { parts } = cut(tree.children, 2);
  const section = parts.find((p) => p[0].data.id === "verbs-by-topic") ?? [];
  const topics = [];
  const topicOf = new Map();
  for (const sub of cut(section, 3).parts) {
    const topic = { id: sub[0].data.id, title: textOf(sub[0]).trim() };
    topics.push(topic);
    visit({ type: "root", children: sub }, "link", (link) => {
      const verb = link.url.match(/protocol-verbs\.md#([\w-]+)$/)?.[1];
      if (verb && !topicOf.has(verb)) topicOf.set(verb, topic.id);
    });
  }
  return { topics, topicOf };
}

// The topic of a verb heading such as "split-window, zoom-window": the topic
// of its first verb. A heading with no verb, such as "Selectors", stays in the
// topic of the heading before it.
function topicFor(heading, topicOf, previous) {
  for (const word of textOf(heading).split(/[\s,]+/)) {
    const verb = word.replace(/`/g, "");
    if (topicOf.has(verb)) return topicOf.get(verb);
  }
  return previous ?? "other-verbs";
}

// Splits a part over the budget at its headings of the given depth, so no
// page is larger than the budget unless one section is.
function chunk(part, budget, depth) {
  if (sizeOf(part.nodes) <= budget) return [part];
  // As many chunks as the budget needs, each near the same size.
  const total = sizeOf(part.nodes);
  const target = total / Math.ceil(total / budget);
  const { head, parts } = cut(part.nodes, depth);
  const chunks = [[...head]];
  for (const p of parts) {
    if (
      chunks.at(-1).length &&
      sizeOf(chunks.at(-1)) + sizeOf(p) / 2 > target
    ) {
      chunks.push([]);
    }
    chunks.at(-1).push(...p);
  }
  if (chunks.length === 1) return [part];
  return chunks.map((nodes, i) => ({
    ...part,
    // Not "-2": fumadocs search names the entries of a page URL-0, URL-1 and
    // so on, so a page named URL-2 would collide with one of them.
    slug: i ? `${part.slug}-part-${i + 1}` : part.slug,
    title: `${part.title} (part ${i + 1} of ${chunks.length})`,
    // The lead goes on the first page of the group only.
    lead: i ? undefined : part.lead,
    nodes,
  }));
}

// The parts of a page: the index (slug ""), then one part per section or
// verb topic that moves to a page of its own.
function split(page, tree, topicInfo) {
  const conf = page.split;
  if (!conf) return [{ slug: "", title: page.title, nodes: tree.children }];
  const { head, parts: sections } = cut(tree.children, 2);
  const index = { slug: "", title: page.title, nodes: [...head] };
  const parts = [];
  // A group takes the section it starts at and every section after it, up
  // to the next group, so a section the doc adds joins the group before it.
  let group;
  for (const section of sections) {
    const id = section[0].data.id;
    const byTopic = conf.byTopic?.[id];
    const start = conf.groups?.find((g) => g.start === id);
    if (start) {
      group = {
        slug: start.slug,
        title: start.title,
        lead: start.lead,
        nodes: [],
        depth: 2,
      };
      parts.push(group);
    }
    if (conf.index.includes(id)) {
      index.nodes.push(...section);
    } else if (group) {
      group.nodes.push(...section);
    } else if (byTopic) {
      // The heading and the text before the first verb stay on the index.
      const { head: intro, parts: verbs } = cut(section, 3);
      index.nodes.push(...intro);
      const groups = new Map();
      let topic;
      for (const verb of verbs) {
        topic = topicFor(verb[0], topicInfo.topicOf, topic);
        if (!groups.has(topic)) groups.set(topic, []);
        groups.get(topic).push(...verb);
      }
      // In the order of "Verbs by topic".
      const order = topicInfo.topics.map((t) => t.id);
      const known = [...groups.keys()].sort(
        (a, b) => order.indexOf(a) - order.indexOf(b),
      );
      for (const t of known) {
        const title = topicInfo.topics.find((x) => x.id === t)?.title ?? t;
        parts.push({
          slug: byTopic.prefix + t,
          title: byTopic.title + title,
          nodes: groups.get(t),
          // The verbs are H3 under the section's H2, which stays on the
          // index. On their own page they become H2.
          promote: true,
        });
      }
    } else {
      parts.push({
        slug: conf.names?.[id] ?? id,
        title: textOf(section[0]).trim(),
        nodes: section,
      });
    }
  }
  const seen = new Set(sections.map((s) => s[0].data.id));
  for (const id of [
    ...conf.index,
    ...(conf.groups ?? []).map((g) => g.start),
  ]) {
    if (!seen.has(id)) {
      console.warn(
        `${page.slug}: no section ${id}. Update its split in scripts/reference-docs.mjs.`,
      );
    }
  }
  const out = [index];
  for (const p of parts) out.push(...chunk(p, conf.budget, p.depth ?? 3));
  for (const p of out) {
    if (sizeOf(p.nodes) > conf.budget) {
      console.warn(
        `${page.slug}/${p.slug || "index"}: ${sizeOf(p.nodes)} bytes of markdown, over the budget of ${conf.budget}`,
      );
    }
  }
  return out;
}

function partPath(page, part) {
  return part.slug ? `/docs/${page.slug}/${part.slug}` : `/docs/${page.slug}`;
}

function renderPart(page, part, parts, ref, known, ctx) {
  const tree = { type: "root", children: structuredClone(part.nodes) };
  visit(tree, (node, index, parent) => {
    if (node.type === "heading") {
      const text = textOf(node).trim();
      const id = node.data.id;
      if (part.promote) node.depth = Math.max(2, node.depth - 1);
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
      node.url = rewriteUrl(node.url, page.source, ref, ctx);
    }
    if (node.type === "image") {
      node.url = rewriteUrl(node.url, page.source, ref, ctx).replace(
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

  // remark-stringify escapes the bracket of a heading id, "\[#id]", and an
  // underscore in it, "\_". Fumadocs reads the id either way, and
  // scripts/commands.mjs reads it plain.
  const bodyOut = body.replace(
    /^(#{1,6} .*) \\\[#((?:[\w.-]|\\_)+)\]$/gm,
    (_, heading, id) => `${heading} [#${id.replaceAll("\\_", "_")}]`,
  );

  const isIndex = !part.slug;
  const front = [
    "---",
    `title: ${JSON.stringify(part.title)}`,
    `description: ${JSON.stringify(isIndex ? page.description : `${part.title}: part of the ${page.title} of TUIOS.`)}`,
    `icon: ${page.icon}`,
    "---",
    "",
    'import { Since } from "@/components/mdx/since";',
  ];
  if (isIndex && parts.length > 1) {
    front.push(
      'import { AnchorRedirect } from "@/components/mdx/anchor-redirect";',
    );
  }
  front.push(
    "",
    `{/* Written by scripts/reference-docs.mjs from tuios ${page.source} at ${ref}. Do not edit: change the doc in tuios and move reference/TUIOS_REF. */}`,
    "",
  );
  const repoLink = `[tuios repository](${REPO}/blob/${ref}/${page.source})`;
  if (parts.length === 1) {
    front.push(
      `This page is ${"`"}${page.source}${"`"} of the ${repoLink}, at the version this site documents.`,
      "",
    );
  } else if (isIndex) {
    front.push(
      `These pages are ${"`"}${page.source}${"`"} of the ${repoLink}, at the version this site documents.`,
      "",
      `<AnchorRedirect page="${page.slug}" />`,
      "",
    );
  } else {
    front.push(
      `This page is one part of ${"`"}${page.source}${"`"} of the ${repoLink}. The [${page.title}](/docs/${page.slug}) page lists every part.`,
      "",
    );
  }
  if (isIndex && page.lead) front.push(page.lead, "");
  if (!isIndex && part.lead) front.push(part.lead, "");
  if (isIndex && parts.length > 1) {
    front.push(
      "**The pages of this reference:**",
      "",
      ...parts.slice(1).map((p) => `- [${p.title}](${partPath(page, p)})`),
      "",
    );
  }
  return `${front.join("\n")}\n${bodyOut}`;
}

// Reads every page and splits it. anchors maps each page slug to the part of
// each of its anchors.
export async function build(src) {
  const parsed = new Map();
  for (const page of pages) parsed.set(page.slug, await parse(page, src));
  const topicInfo = topicsOf(parsed.get("control-protocol").tree);
  const anchors = new Map();
  const built = [];
  for (const page of pages) {
    const parts = split(page, parsed.get(page.slug).tree, topicInfo);
    const ids = new Map();
    for (const part of parts) {
      visit({ type: "root", children: part.nodes }, (node) => {
        if (node.type === "heading")
          ids.set(node.data.id, partPath(page, part));
        // An anchor the doc sets itself: <a id="nonce-scope"></a>.
        if (node.type === "html") {
          for (const m of node.value.matchAll(/<a\s+(?:id|name)="([^"]+)"/g)) {
            ids.set(m[1], partPath(page, part));
          }
        }
      });
    }
    anchors.set(page.slug, ids);
    built.push({ page, parts });
  }
  return { anchors, built };
}

export async function render(src, ref, known) {
  const { anchors, built } = await build(src);
  const files = [];
  for (const { page, parts } of built) {
    for (const part of parts) {
      const ctx = { anchors, slug: page.slug, path: partPath(page, part) };
      const name =
        parts.length === 1
          ? `${page.slug}.mdx`
          : `${page.slug}/${part.slug || "index"}.mdx`;
      files.push({
        name,
        text: renderPart(page, part, parts, ref, known, ctx),
      });
    }
    if (parts.length > 1) {
      const meta = {
        title: page.title,
        icon: page.icon,
        pages: ["index", ...parts.slice(1).map((p) => p.slug)],
      };
      files.push({
        name: `${page.slug}/meta.json`,
        text: `${JSON.stringify(meta, null, 2)}\n`,
      });
    }
  }
  // Only the anchors that left the index: the redirect needs no others.
  const moved = {};
  for (const [slug, ids] of anchors) {
    const out = {};
    for (const [id, at] of ids) if (at !== `/docs/${slug}`) out[id] = at;
    if (Object.keys(out).length) moved[slug] = out;
  }
  return { files, moved, built };
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
  const docs = path.join(site, "content/docs");
  const { files, moved, built } = await render(src, ref, known);
  // The script owns these paths: a page that was split before and is not now
  // (or the other way) leaves nothing behind.
  for (const { page } of built) {
    await rm(path.join(docs, `${page.slug}.mdx`), { force: true });
    await rm(path.join(docs, page.slug), { recursive: true, force: true });
  }
  for (const f of files) {
    const out = path.join(docs, f.name);
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, f.text);
  }
  const anchorsFile = path.join(site, "lib/reference/anchors.json");
  await mkdir(path.dirname(anchorsFile), { recursive: true });
  await writeFile(anchorsFile, `${JSON.stringify(moved, null, 2)}\n`);
  // The search index takes only the headings of these pages
  // (app/api/search.json/route.ts).
  await writeFile(
    path.join(site, "lib/reference/pages.json"),
    `${JSON.stringify(
      pages.map((p) => p.slug),
      null,
      2,
    )}\n`,
  );
  for (const { page, parts } of built) {
    console.log(
      `wrote ${parts.length === 1 ? `content/docs/${page.slug}.mdx` : `${parts.length} pages in content/docs/${page.slug}/`} from ${page.source}`,
    );
  }
}
