/**
 * The shell in the pane on the 404 page (components/eggs/lost-shell.tsx).
 * The site's pages are its file system: a URL with pages under it is a
 * directory, and every URL is a page. Plain functions, tested by shell.test.ts.
 */

export type Seg = {
  t: string;
  c?: "dir" | "page" | "err" | "muted" | "ok";
  /** The page a "page" segment links to. */
  href?: string;
};
export type Line = Seg[];

export type Fs = {
  /** Directory path to its children's names, sorted, dirs marked by "/". */
  children: Map<string, string[]>;
  pages: Set<string>;
};

export type Result = {
  out: Line[];
  cwd: string;
  /** A page to open. */
  go?: string;
  clear?: boolean;
};

function parent(path: string) {
  const i = path.lastIndexOf("/");
  return i <= 0 ? "/" : path.slice(0, i);
}

export function buildFs(urls: string[]): Fs {
  const pages = new Set(urls.map((u) => (u === "" ? "/" : u)));
  pages.add("/");
  const kids = new Map<string, Set<string>>();
  for (const url of pages) {
    let path = url;
    while (path !== "/") {
      const up = parent(path);
      if (!kids.has(up)) kids.set(up, new Set());
      kids.get(up)?.add(path.slice(up === "/" ? 1 : up.length + 1));
      path = up;
    }
  }
  const children = new Map<string, string[]>();
  for (const [dir, names] of kids) {
    children.set(
      dir,
      [...names]
        .map((n) => {
          const full = dir === "/" ? `/${n}` : `${dir}/${n}`;
          return kids.has(full) ? `${n}/` : n;
        })
        .sort((a, b) => a.localeCompare(b)),
    );
  }
  return { children, pages };
}

/** An argument against the current directory, as an absolute path. */
export function resolve(cwd: string, arg: string): string {
  if (!arg || arg === "~") return "/";
  const parts = (
    arg.startsWith("/") || arg.startsWith("~") ? [] : cwd.split("/")
  )
    .concat(arg.replace(/^~/, "").split("/"))
    .filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    if (p === ".") continue;
    if (p === "..") out.pop();
    else out.push(p);
  }
  return `/${out.join("/")}`;
}

const isDir = (fs: Fs, path: string) => fs.children.has(path);

function list(fs: Fs, path: string): Line[] {
  const names = fs.children.get(path) ?? [];
  if (!names.length) return [];
  return [
    names.map((n) => {
      const href = path === "/" ? `/${n}` : `${path}/${n}`;
      return n.endsWith("/")
        ? { t: n, c: "dir" as const }
        : { t: n, c: "page" as const, href };
    }),
  ];
}

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return row[b.length];
}

/** The page whose name is closest to the one asked for, if any is close. */
export function nearest(fs: Fs, path: string): string | null {
  const want = path.replace(/\/+$/, "").split("/").pop()?.toLowerCase() ?? "";
  if (!want) return null;
  let best: string | null = null;
  let bestD = Number.POSITIVE_INFINITY;
  for (const page of fs.pages) {
    const name = page.split("/").pop() ?? "";
    const d = distance(want, name.toLowerCase());
    if (d < bestD) {
      bestD = d;
      best = page;
    }
  }
  // Short names are too easy to match by chance.
  if (want.length < 4) return null;
  return bestD <= Math.max(1, Math.floor(want.length / 3)) ? best : null;
}

const HELP: Line[] = [
  [{ t: "ls [dir]     list pages and directories" }],
  [{ t: "cd <dir>     go into a directory, or open a page" }],
  [{ t: "open [page]  open a page (the current one with no name)" }],
  [{ t: "pwd          print the current directory" }],
  [{ t: "clear        clear the pane" }],
  [{ t: "Tab completes a name. Up and Down recall commands.", c: "muted" }],
];

export function run(fs: Fs, cwd: string, line: string): Result {
  const [cmd = "", ...args] = line.trim().split(/\s+/);
  const arg = args[0] ?? "";
  const err = (t: string): Result => ({ out: [[{ t, c: "err" }]], cwd });

  switch (cmd) {
    case "":
      return { out: [], cwd };
    case "help":
    case "?":
      return { out: HELP, cwd };
    case "ls": {
      // A bare ls lists the current directory. A bare cd goes home.
      const path = resolve(cwd, arg || ".");
      if (isDir(fs, path)) return { out: list(fs, path), cwd };
      if (fs.pages.has(path))
        return { out: [[{ t: arg, c: "page", href: path }]], cwd };
      return err(`ls: ${arg}: no such file or directory`);
    }
    case "cd": {
      const path = resolve(cwd, arg);
      if (isDir(fs, path)) return { out: [], cwd: path };
      if (fs.pages.has(path)) return { out: [], cwd, go: path };
      const near = nearest(fs, path);
      return {
        out: [
          [{ t: `cd: no such file or directory: ${arg}`, c: "err" }],
          ...(near
            ? [
                [
                  { t: "did you mean " },
                  { t: near, c: "page" as const, href: near },
                ],
              ]
            : []),
        ],
        cwd,
      };
    }
    case "open": {
      const path = resolve(cwd, arg || ".");
      if (fs.pages.has(path)) return { out: [], cwd, go: path };
      if (isDir(fs, path)) return err(`open: ${path} is a directory`);
      return err(`open: ${arg}: no such page`);
    }
    case "pwd":
      return { out: [[{ t: cwd }]], cwd };
    case "clear":
      return { out: [], cwd, clear: true };
    case "whoami":
      return { out: [[{ t: "a reader, a long way from home" }]], cwd };
    case "exit":
    case ":q":
    case ":q!":
    case ":wq":
    case ":x":
      return {
        out: [
          [
            {
              t: "Nice try. This pane is a web page. Close the tab, or type cd ~ to go home.",
              c: "muted",
            },
          ],
        ],
        cwd,
      };
    case "tuios":
      return {
        out: [
          [
            { t: "You are reading its website. Install it from " },
            {
              t: "/docs/getting-started",
              c: "page",
              href: "/docs/getting-started",
            },
          ],
        ],
        cwd,
      };
    case "sudo":
      return err(
        "tilly is not in the sudoers file. This will not be reported.",
      );
    default:
      return err(`${cmd}: command not found. Type help for the commands.`);
  }
}

/**
 * Completes the last word of a command line to the longest prefix the
 * matching names share. options lists the matches when there is more than
 * one, so the pane can show them as a shell does.
 */
export function complete(
  fs: Fs,
  cwd: string,
  line: string,
): { line: string; options: string[] } {
  const m = line.match(/^(\s*\S+\s+)(\S*)$/);
  if (!m) return { line, options: [] };
  const [, head, word] = m;
  const slash = word.lastIndexOf("/");
  const dirPart = slash >= 0 ? word.slice(0, slash + 1) : "";
  const base = word.slice(slash + 1);
  const dir = resolve(cwd, dirPart || ".");
  const names = (fs.children.get(dir) ?? []).filter((n) => n.startsWith(base));
  if (!names.length) return { line, options: [] };
  let common = names[0];
  for (const n of names) {
    let i = 0;
    while (i < common.length && common[i] === n[i]) i++;
    common = common.slice(0, i);
  }
  return {
    line: `${head}${dirPart}${common}`,
    options: names.length > 1 ? names : [],
  };
}
