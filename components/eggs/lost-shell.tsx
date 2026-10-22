"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  buildFs,
  complete,
  type Line,
  nearest,
  run,
  type Seg,
} from "@/lib/eggs/shell";
import { TILLY_EVENT } from "@/lib/eggs/triggers";

type Entry = { prompt?: string; line: Line };

const promptFor = (cwd: string) =>
  `tilly@tuios.dev:${cwd === "/" ? "~" : `~${cwd}`}$`;

const tone: Record<NonNullable<Seg["c"]>, string> = {
  dir: "text-fd-primary font-semibold",
  page: "text-fd-foreground underline decoration-fd-border underline-offset-2",
  err: "text-fd-foreground",
  muted: "text-fd-muted-foreground",
  ok: "text-fd-primary",
};

/**
 * The pane on the 404 page: a focused tuios pane, its title in the top
 * border, with a shell over the site's pages (lib/eggs/shell.ts).
 */
export function LostShell() {
  const router = useRouter();
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/pages.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: string[]) => setUrls(list))
      .catch(() => {});
  }, []);
  const fs = useMemo(() => buildFs(urls), [urls]);
  const [cwd, setCwd] = useState("/");
  const [log, setLog] = useState<Entry[]>([]);
  const [value, setValue] = useState("");
  const history = useRef<string[]>([]);
  const back = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  // The opening lines name the path that was asked for. It is read on the
  // client: the same 404.html answers every missing path.
  useEffect(() => {
    // Wait for the page list: buildFs always holds "/".
    if (fs.pages.size < 2) return;
    const path = decodeURI(window.location.pathname).replace(/\/+$/, "") || "/";
    const near = nearest(fs, path);
    setLog([
      { prompt: promptFor("/"), line: [{ t: `cd ${path}` }] },
      { line: [{ t: `cd: no such file or directory: ${path}`, c: "err" }] },
      ...(near
        ? [
            {
              line: [
                { t: "did you mean " },
                { t: near, c: "page" as const, href: near },
              ],
            },
          ]
        : []),
      {
        line: [
          {
            t: "Type help for the commands, or ls to look around.",
            c: "muted",
          },
        ],
      },
    ]);
  }, [fs]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to the end each time the log grows
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  const submit = () => {
    const line = value;
    setValue("");
    if (line.trim()) history.current.push(line);
    back.current = 0;
    const r = run(fs, cwd, line);
    const echo: Entry = { prompt: promptFor(cwd), line: [{ t: line }] };
    setLog((l) =>
      r.clear ? [] : [...l, echo, ...r.out.map((x) => ({ line: x }))],
    );
    setCwd(r.cwd);
    if (r.go) router.push(r.go);
    if (r.tilly) window.dispatchEvent(new Event(TILLY_EVENT));
  };

  const recall = (step: number) => {
    const h = history.current;
    back.current = Math.min(h.length, Math.max(0, back.current + step));
    setValue(back.current ? h[h.length - back.current] : "");
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: a click anywhere on the pane focuses its input, which the keyboard reaches by Tab
    <div
      className="relative rounded-lg border-2 border-fd-primary bg-fd-card font-mono text-sm shadow-sm"
      onClick={() => input.current?.focus()}
      role="presentation"
    >
      <span className="absolute -top-3 left-3 bg-fd-background px-1.5 text-xs text-fd-primary">
        404 · zsh
      </span>
      <div
        ref={scroller}
        role="log"
        aria-live="polite"
        aria-label="Shell output"
        className="h-72 overflow-y-auto px-3 pt-4 pb-2 sm:h-80"
      >
        {log.map((e, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: the log only grows, or clears as a whole
            key={i}
            className={cn(
              "break-words whitespace-pre-wrap",
              e.line.length > 2 && "flex flex-wrap gap-x-[2ch]",
            )}
          >
            {e.prompt && (
              <span className="text-fd-muted-foreground">{e.prompt} </span>
            )}
            {e.line.map((s, j) =>
              s.c === "page" && s.href ? (
                <a
                  // biome-ignore lint/suspicious/noArrayIndexKey: segments of one fixed line
                  key={j}
                  href={s.href}
                  className={tone.page}
                >
                  {s.t}
                </a>
              ) : (
                // biome-ignore lint/suspicious/noArrayIndexKey: segments of one fixed line
                <span key={j} className={cn(s.c && tone[s.c])}>
                  {s.t}
                </span>
              ),
            )}
          </div>
        ))}
        <label className="flex items-baseline gap-2">
          <span className="shrink-0 text-fd-muted-foreground">
            {promptFor(cwd)}
          </span>
          <span className="sr-only">Command</span>
          <input
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              } else if (e.key === "Tab" && value.trim()) {
                e.preventDefault();
                const c = complete(fs, cwd, value);
                if (c.line === value && c.options.length) {
                  setLog((l) => [
                    ...l,
                    { prompt: promptFor(cwd), line: [{ t: value }] },
                    {
                      line: c.options.map((t) => ({
                        t,
                        c: t.endsWith("/")
                          ? ("dir" as const)
                          : ("muted" as const),
                      })),
                    },
                  ]);
                }
                setValue(c.line);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                recall(1);
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                recall(-1);
              } else if (e.key === "l" && e.ctrlKey) {
                e.preventDefault();
                setLog([]);
              }
            }}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            className="min-w-0 flex-1 bg-transparent text-base text-fd-foreground sm:text-sm caret-fd-primary outline-none"
          />
        </label>
      </div>
    </div>
  );
}
