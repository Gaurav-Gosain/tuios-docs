"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { GalleryFile, GalleryNote } from "@/lib/gallery/feed";
import type { LookKey } from "@/lib/gallery/look-check";

/**
 * A gallery config or theme, highlighted with Shiki in the site's code themes
 * (github-light and github-dark, as the docs code blocks use), with notes on
 * its keys.
 *
 * The text is the cleaned text from the feed. Shiki only splits it into
 * tokens, and each token is drawn as a React text child with its two colours
 * as CSS variables, so no markup from a comment, or from Shiki, is ever parsed
 * as HTML. The notes come with the feed (see lib/gallery/annotate.ts): a key
 * with a note can be hovered, focused or tapped for its description, and a
 * bad value or a key the look leaves out is marked on its line.
 *
 * The highlighter and the key descriptions load the first time a dialog
 * opens. Until then the text and its marks show without colour.
 */

type Token = { text: string; light?: string; dark?: string };
type Loaded = {
  highlight: (text: string, lang: "toml" | "json") => Token[][];
  docs: Map<string, LookKey>;
};

const COLOR = /^#[0-9a-fA-F]{3,8}$/;

let loading: Promise<Loaded> | null = null;

function loadHighlighter(): Promise<Loaded> {
  loading ??= (async () => {
    const [core, engine, toml, json, light, dark, keys] = await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
      import("shiki/langs/toml.mjs"),
      import("shiki/langs/json.mjs"),
      import("shiki/themes/github-light.mjs"),
      import("shiki/themes/github-dark.mjs"),
      import("@/lib/gallery/look-keys.json"),
    ]);
    const highlighter = await core.createHighlighterCore({
      themes: [light.default, dark.default],
      langs: [toml.default, json.default],
      engine: engine.createJavaScriptRegexEngine(),
    });
    return {
      highlight: (text, lang) =>
        highlighter
          .codeToTokensWithThemes(text, {
            lang,
            themes: { light: "github-light", dark: "github-dark" },
          })
          .map((line) =>
            line.map((t) => ({
              text: t.content,
              light: t.variants.light?.color,
              dark: t.variants.dark?.color,
            })),
          ),
      docs: new Map(
        (keys.default.keys as LookKey[]).map((k) => [k.path, k] as const),
      ),
    };
  })();
  return loading;
}

/** The Shiki language of a file: JSON for a theme, TOML for anything else. */
function langOf(file: GalleryFile): "toml" | "json" {
  return file.label === "json" || file.label === "theme" ? "json" : "toml";
}

/** The short mark drawn after a line whose key has a problem. */
function markOf(note: GalleryNote): string | null {
  switch (note.kind) {
    case "bad":
      return note.why ?? "tuios refuses this value";
    case "left":
      return "left out by tuios look apply";
    case "unknown":
      return "unknown key";
    default:
      return null;
  }
}

type Piece = Token & { from: number; to: number };

/** The tokens of one line, cut at every note edge. */
function cut(tokens: Token[], edges: number[]): Piece[] {
  const out: Piece[] = [];
  let at = 0;
  for (const t of tokens) {
    let from = at;
    const to = at + t.text.length;
    for (const e of edges) {
      if (e > from && e < to) {
        out.push({ ...t, text: t.text.slice(from - at, e - at), from, to: e });
        from = e;
      }
    }
    out.push({ ...t, text: t.text.slice(from - at), from, to });
    at = to;
  }
  return out;
}

function Colored({ piece }: { piece: Piece }) {
  return (
    <span
      style={
        {
          "--shiki-light":
            piece.light && COLOR.test(piece.light) ? piece.light : undefined,
          "--shiki-dark":
            piece.dark && COLOR.test(piece.dark) ? piece.dark : undefined,
        } as React.CSSProperties
      }
    >
      {piece.text}
    </span>
  );
}

const KEY_STYLE: Record<GalleryNote["kind"], string> = {
  doc: "decoration-fd-muted-foreground/50 decoration-dotted",
  bad: "decoration-fd-muted-foreground/50 decoration-dotted",
  left: "decoration-fd-muted-foreground decoration-dotted opacity-60",
  unknown: "decoration-wavy decoration-amber-500",
};

const MARK_STYLE: Record<GalleryNote["kind"], string> = {
  doc: "",
  bad: "bg-red-500/10 text-red-700 dark:text-red-300",
  left: "bg-fd-muted text-fd-muted-foreground",
  unknown: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
};

type Active = { index: number; pinned: boolean };

export function HighlightedCode({ file }: { file: GalleryFile }) {
  const [loaded, setLoaded] = useState<{
    lines: Token[][];
    docs: Map<string, LookKey>;
  } | null>(null);
  const [active, setActive] = useState<Active | null>(null);
  const [place, setPlace] = useState<{
    top: number;
    left: number;
    above: boolean;
  } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const keys = useRef(new Map<number, HTMLElement>());
  const tipId = useId();
  const notes = file.notes ?? [];

  useEffect(() => {
    let live = true;
    setLoaded(null);
    loadHighlighter()
      .then(({ highlight, docs }) => {
        if (live)
          setLoaded({ lines: highlight(file.text, langOf(file)), docs });
      })
      // Offline or a failed chunk: the plain text and its marks stay.
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [file]);

  // Place the note under its key, or over it near the end of the text, inside
  // the box around the code rather than the code's own scrolling area, which
  // would clip it.
  useEffect(() => {
    if (!active) {
      setPlace(null);
      return;
    }
    const key = keys.current.get(active.index);
    const box = wrap.current;
    if (!key || !box) return;
    const k = key.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    const above = b.bottom - k.bottom < 140;
    const width = Math.min(320, b.width - 16);
    setPlace({
      top: above ? k.top - b.top - 6 : k.bottom - b.top + 6,
      left: Math.max(8, Math.min(k.left - b.left, b.width - width - 8)),
      above,
    });
  }, [active]);

  // A pinned note closes on a press anywhere else.
  useEffect(() => {
    if (!active?.pinned) return;
    const close = (e: PointerEvent) => {
      const key = keys.current.get(active.index);
      if (key && e.target instanceof Node && key.contains(e.target)) return;
      setActive(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [active]);

  const register = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      if (el) keys.current.set(index, el);
      else keys.current.delete(index);
    },
    [],
  );

  const textLines = file.text.split("\n");
  const lines =
    loaded?.lines ?? textLines.map((text) => [{ text } satisfies Token]);
  const shown = active ? notes[active.index] : undefined;

  return (
    <div ref={wrap} className="relative">
      <pre className="shiki not-prose overflow-x-auto px-4 pb-4 font-mono text-[13px] leading-relaxed">
        <code>
          {lines.map((tokens, i) => {
            const here = notes
              .map((note, index) => ({ note, index }))
              .filter(({ note }) => note.line === i);
            const edges = here
              .flatMap(({ note }) => [
                note.start,
                note.end,
                note.valueStart ?? -1,
                note.valueEnd ?? -1,
              ])
              .filter((e) => e >= 0)
              .sort((a, b) => a - b);
            const pieces = cut(tokens, edges);
            const out: React.ReactNode[] = [];
            for (let p = 0; p < pieces.length; p++) {
              const piece = pieces[p];
              const keyOf = here.find(({ note }) => note.start === piece.from);
              if (keyOf) {
                const group: Piece[] = [];
                while (p < pieces.length && pieces[p].to <= keyOf.note.end) {
                  group.push(pieces[p]);
                  p++;
                }
                p--;
                const { note, index } = keyOf;
                const open = active?.index === index;
                out.push(
                  // biome-ignore lint/a11y/useSemanticElements: a span keeps the key selectable inside the code, which a button would not
                  <span
                    key={`k${piece.from}`}
                    ref={register(index)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={open}
                    aria-describedby={open ? tipId : undefined}
                    aria-label={`${note.path}: about this key`}
                    onMouseEnter={() =>
                      setActive((a) =>
                        a?.pinned ? a : { index, pinned: false },
                      )
                    }
                    onMouseLeave={() =>
                      setActive((a) => (a?.pinned ? a : null))
                    }
                    onFocus={() =>
                      setActive((a) =>
                        a?.index === index ? a : { index, pinned: false },
                      )
                    }
                    onBlur={() =>
                      setActive((a) => (a?.index === index ? null : a))
                    }
                    onClick={() =>
                      setActive((a) =>
                        a?.index === index && a.pinned
                          ? null
                          : { index, pinned: true },
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setActive(null);
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActive((a) =>
                          a?.index === index && a.pinned
                            ? null
                            : { index, pinned: true },
                        );
                      }
                    }}
                    className={`cursor-help rounded-sm underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-fd-primary ${KEY_STYLE[note.kind]} ${open ? "bg-fd-primary/10" : ""}`}
                  >
                    {group.map((g) => (
                      <Colored key={g.from} piece={g} />
                    ))}
                  </span>,
                );
                continue;
              }
              const bad = here.find(
                ({ note }) =>
                  note.valueStart !== undefined &&
                  piece.from >= note.valueStart &&
                  piece.to <= (note.valueEnd ?? 0),
              );
              out.push(
                bad ? (
                  <span
                    key={`v${piece.from}`}
                    className="underline decoration-red-500 decoration-wavy underline-offset-4"
                  >
                    <Colored piece={piece} />
                  </span>
                ) : (
                  <Colored key={`t${piece.from}`} piece={piece} />
                ),
              );
            }
            const marks = here.flatMap(({ note }) => {
              const text = markOf(note);
              return text ? [{ note, text }] : [];
            });
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: lines have no identity but their place
              <span key={i} className="line">
                {out}
                {marks.map(({ note, text }) => (
                  <span
                    key={`m${note.start}`}
                    className={`ms-3 select-none rounded px-1.5 py-px font-sans text-[11px] ${MARK_STYLE[note.kind]}`}
                  >
                    {text}
                  </span>
                ))}
                {i < lines.length - 1 ? "\n" : null}
              </span>
            );
          })}
        </code>
      </pre>
      {shown && place ? (
        <div
          id={tipId}
          role="tooltip"
          style={{
            top: place.top,
            left: place.left,
            transform: place.above ? "translateY(-100%)" : undefined,
          }}
          className="absolute z-10 w-[min(20rem,calc(100%-1rem))] rounded-lg border border-fd-border bg-fd-popover p-3 text-fd-popover-foreground text-xs leading-relaxed shadow-lg"
        >
          <NoteBody note={shown} doc={loaded?.docs.get(shown.path)} />
        </div>
      ) : null}
    </div>
  );
}

/** What a look key takes, in words. */
function takes(doc: LookKey): string {
  if (doc.type === "bool") return "true or false";
  if (doc.type === "int") {
    return doc.max !== undefined
      ? `a whole number from ${doc.min ?? 0} to ${doc.max}`
      : "a whole number";
  }
  if (doc.color) {
    const words = doc.accepted?.length ? `, or ${doc.accepted.join(", ")}` : "";
    return `a colour: #rrggbb, 0 to 255, a colour name or a theme role${words}`;
  }
  if (doc.accepted?.length) return `one of ${doc.accepted.join(", ")}`;
  return "text";
}

function NoteBody({ note, doc }: { note: GalleryNote; doc?: LookKey }) {
  return (
    <>
      <p className="font-mono text-[11px] text-fd-muted-foreground">
        {note.path}
      </p>
      {note.kind === "bad" ? (
        <p className="mt-1 font-medium text-red-700 dark:text-red-300">
          tuios refuses this value: {note.why ?? "it does not pass the check"}.
        </p>
      ) : null}
      {note.kind === "left" ? (
        <p className="mt-1">
          <code className="font-mono">tuios look apply</code> leaves out this
          key. A look sets only how tuios looks.
        </p>
      ) : null}
      {note.kind === "unknown" ? (
        <p className="mt-1">tuios has no key with this name.</p>
      ) : null}
      {doc && (note.kind === "doc" || note.kind === "bad") ? (
        <>
          {doc.description ? (
            <p className="mt-1">{doc.description.replace(/\.$/, "")}.</p>
          ) : null}
          <p className="mt-1 text-fd-muted-foreground">Takes {takes(doc)}.</p>
          {doc.default !== undefined ? (
            <p className="text-fd-muted-foreground">
              Default:{" "}
              <code className="font-mono">
                {doc.default === "" ? '""' : doc.default}
              </code>
            </p>
          ) : null}
        </>
      ) : null}
    </>
  );
}
