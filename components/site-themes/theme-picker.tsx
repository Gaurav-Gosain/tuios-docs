"use client";
import { CalendarDays, Check, Search, X } from "lucide-react";
import { useTheme } from "next-themes";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/cn";
import {
  deriveTheme,
  isDarkGround,
  passes,
  type RawTheme,
  swatch,
  themeCss,
} from "@/lib/site-themes/derive";
import {
  appliedId,
  applyTheme,
  dayIndex,
  readStored,
  writeStored,
} from "@/lib/site-themes/store";

type Entry = {
  /** null is the site default. */
  id: string | null;
  name: string;
  dark: boolean;
  colors: string[];
  raw?: RawTheme;
};

type Filter = "all" | "dark" | "light";

function prefersDark(mode: string | undefined) {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  try {
    return matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

/**
 * The tuios theme picker. It loads with the theme data the first time it
 * opens (see ThemeHost). Arrow keys and the pointer preview a theme on the
 * page; Enter or a click keeps it; Escape or a click outside puts the kept
 * one back.
 */
export default function ThemePicker({ onClose }: { onClose: () => void }) {
  const { theme: mode, setTheme } = useTheme();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [themes, setThemes] = useState<RawTheme[] | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState(0);
  const [kept] = useState(() => appliedId());
  const committed = useRef(false);

  useEffect(() => {
    let live = true;
    import("@/lib/site-themes/themes.json").then((m) => {
      if (!live) return;
      const all = (m.default.themes as RawTheme[])
        .filter((t) => passes(deriveTheme(t)))
        .sort((a, b) => a.name.localeCompare(b.name));
      setThemes(all);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
    input.current?.focus();
  }, []);

  // The mode to go back to when the default is chosen: the one from before a
  // theme was kept, else the current one.
  const defaultMode = readStored()?.prev ?? mode ?? "system";

  const entries = useMemo<Entry[]>(() => {
    if (!themes) return [];
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const out: Entry[] = [];
    if (!words.length && filter === "all") {
      out.push({
        id: null,
        name: "Site default",
        dark: prefersDark(defaultMode),
        colors: [],
      });
    }
    for (const raw of themes) {
      const hay = `${raw.name} ${raw.id}`.toLowerCase();
      if (!words.every((w) => hay.includes(w))) continue;
      const dark = isDarkGround(`#${raw.bg}`);
      if (filter !== "all" && dark !== (filter === "dark")) continue;
      out.push({ id: raw.id, name: raw.name, dark, colors: swatch(raw), raw });
    }
    // A name that starts with the first word comes first, so "tok" puts
    // Tokyo Night at the top. The sort is stable, so the rest stay in order.
    if (words.length) {
      const starts = (e: Entry) =>
        e.name.toLowerCase().startsWith(words[0]) ||
        (e.id ?? "").toLowerCase().startsWith(words[0]);
      out.sort((a, b) => Number(starts(b)) - Number(starts(a)));
    }
    return out;
  }, [themes, query, filter, defaultMode]);

  // Start on the kept theme, so the list opens where the reader left it.
  const placed = useRef(false);
  useEffect(() => {
    if (placed.current || !entries.length) return;
    placed.current = true;
    const i = entries.findIndex((e) => e.id === kept);
    setActive(Math.max(0, i));
    requestAnimationFrame(() =>
      list.current
        ?.querySelector<HTMLElement>(`[data-index="${Math.max(0, i)}"]`)
        ?.scrollIntoView({ block: "center" }),
    );
  }, [entries, kept]);

  const show = useCallback(
    (e: Entry | undefined) => {
      if (!e) return;
      if (e.id === null || !e.raw) {
        applyTheme(null, prefersDark(defaultMode));
        return;
      }
      const t = deriveTheme(e.raw);
      applyTheme({ id: t.id, css: themeCss(t) }, t.dark);
    },
    [defaultMode],
  );

  // Typing or changing the filter moves the selection to the top result, so
  // preview that result at once, the same as an arrow key would.
  const searched = useRef({ query, filter });
  // biome-ignore lint/correctness/useExhaustiveDependencies: entries and show follow query and filter; running on them would preview again after every arrow key.
  useEffect(() => {
    const prev = searched.current;
    if (prev.query === query && prev.filter === filter) return;
    searched.current = { query, filter };
    if (!entries.length) return;
    show(entries[0]);
    list.current?.scrollTo({ top: 0 });
  }, [query, filter]);

  const restore = useCallback(() => {
    const s = readStored();
    if (s) applyTheme({ id: s.id, css: s.css }, s.dark);
    else applyTheme(null, prefersDark(mode));
  }, [mode]);

  const close = useCallback(() => {
    if (!committed.current) restore();
    dialog.current?.close();
    onClose();
  }, [onClose, restore]);

  const keep = (e: Entry | undefined) => {
    if (!e) return;
    committed.current = true;
    if (e.id === null || !e.raw) {
      writeStored(null);
      applyTheme(null, prefersDark(defaultMode));
      setTheme(defaultMode);
    } else {
      const t = deriveTheme(e.raw);
      const css = themeCss(t);
      writeStored({
        id: t.id,
        name: t.name,
        dark: t.dark,
        css,
        prev: defaultMode,
      });
      applyTheme({ id: t.id, css }, t.dark);
      setTheme(t.dark ? "dark" : "light");
    }
    close();
  };

  const move = (to: number) => {
    if (!entries.length) return;
    const i = Math.min(entries.length - 1, Math.max(0, to));
    setActive(i);
    show(entries[i]);
    list.current
      ?.querySelector<HTMLElement>(`[data-index="${i}"]`)
      ?.scrollIntoView({ block: "nearest" });
  };

  const onKey = (e: KeyboardEvent) => {
    const page = 8;
    const moves: Record<string, number> = {
      ArrowDown: active + 1,
      ArrowUp: active - 1,
      PageDown: active + page,
      PageUp: active - page,
    };
    if (e.key in moves) {
      e.preventDefault();
      move(moves[e.key]);
    } else if ((e.key === "Home" || e.key === "End") && e.ctrlKey) {
      e.preventDefault();
      move(e.key === "Home" ? 0 : entries.length - 1);
    } else if (e.key === "Escape") {
      // A search field eats the first Escape to clear itself, and the dialog
      // would then stay open on the preview. Escape always puts it back.
      e.preventDefault();
      close();
    } else if (e.key === "Enter") {
      e.preventDefault();
      keep(entries[active]);
    }
  };

  const today = themes ? themes[dayIndex(themes.length)] : undefined;
  const keptName =
    kept === null
      ? "Site default"
      : (themes?.find((t) => t.id === kept)?.name ?? readStored()?.name);
  const activeId = entries[active] ? `tt-opt-${active}` : undefined;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape is the keyboard way out, through onCancel
    <dialog
      ref={dialog}
      aria-label="Themes"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        // A click on the dialog itself is a click on the backdrop.
        if (e.target === dialog.current) close();
      }}
      className={cn(
        "fixed m-0 flex max-w-none flex-col overflow-hidden rounded-xl border bg-fd-popover p-0 text-fd-popover-foreground shadow-2xl backdrop:bg-transparent",
        "max-sm:inset-x-2 max-sm:top-auto max-sm:bottom-2 max-sm:h-[min(32rem,72dvh)] max-sm:w-auto",
        "sm:top-16 sm:right-4 sm:bottom-auto sm:left-auto sm:h-[min(34rem,calc(100dvh-6rem))] sm:w-[23rem]",
        "motion-safe:animate-[tt-in_160ms_ease-out]",
      )}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-medium">Themes</p>
          <p className="truncate text-xs text-fd-muted-foreground">
            {keptName ? `Now: ${keptName}` : " "}
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="rounded-md p-1.5 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="flex items-center gap-2 border-b px-3">
        <Search className="size-4 shrink-0 text-fd-muted-foreground" />
        <input
          ref={input}
          type="search"
          role="combobox"
          aria-expanded="true"
          aria-controls="tt-list"
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          aria-label="Search themes"
          placeholder={
            themes ? `Search ${themes.length} themes` : "Loading themes"
          }
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKey}
          className="h-10 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-fd-muted-foreground sm:text-sm"
        />
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        <fieldset className="inline-flex rounded-md border p-0.5 text-xs">
          <legend className="sr-only">Show</legend>
          {(["all", "dark", "light"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => {
                setFilter(f);
                setActive(0);
              }}
              className={cn(
                "rounded px-2 py-0.5 capitalize",
                filter === f
                  ? "bg-fd-accent text-fd-accent-foreground"
                  : "text-fd-muted-foreground hover:text-fd-accent-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </fieldset>
        {today && (
          <button
            type="button"
            onClick={() =>
              keep({
                id: today.id,
                name: today.name,
                dark: false,
                colors: [],
                raw: today,
              })
            }
            title={`Theme of the day: ${today.name}`}
            className="ms-auto inline-flex min-w-0 items-center gap-1.5 rounded-md border px-2 py-1 text-xs text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            <CalendarDays className="size-3.5 shrink-0" />
            <span className="truncate">Today: {today.name}</span>
          </button>
        )}
      </div>
      <div
        ref={list}
        id="tt-list"
        role="listbox"
        aria-label="Themes"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1.5 pb-1.5"
      >
        {!themes && (
          <p className="px-2 py-6 text-center text-sm text-fd-muted-foreground">
            Loading themes
          </p>
        )}
        {themes && !entries.length && (
          <p className="px-2 py-6 text-center text-sm text-fd-muted-foreground">
            No theme matches.
          </p>
        )}
        {entries.map((e, i) => (
          <div
            key={e.id ?? "default"}
            id={`tt-opt-${i}`}
            data-index={i}
            role="option"
            aria-selected={i === active}
            onPointerEnter={(ev) => {
              if (ev.pointerType !== "mouse" || i === active) return;
              setActive(i);
              show(e);
            }}
            onClick={() => keep(e)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" || ev.key === " ") keep(e);
            }}
            tabIndex={-1}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm",
              i === active && "bg-fd-accent text-fd-accent-foreground",
            )}
          >
            <Chip entry={e} />
            <span className="min-w-0 flex-1 truncate">{e.name}</span>
            <span className="text-xs text-fd-muted-foreground">
              {e.id === null ? "light, dark" : e.dark ? "dark" : "light"}
            </span>
            <Check
              aria-hidden
              className={cn(
                "size-4 shrink-0 text-fd-primary",
                e.id !== kept && "invisible",
              )}
            />
          </div>
        ))}
      </div>
      <p className="hidden border-t px-3 py-1.5 font-mono text-[11px] text-fd-muted-foreground sm:block">
        <kbd>↑</kbd> <kbd>↓</kbd> preview · <kbd>Enter</kbd> keep ·{" "}
        <kbd>Esc</kbd> put back
      </p>
    </dialog>
  );
}

const HUES = ["red", "green", "yellow", "blue", "purple", "cyan"];

/** A small terminal: the theme's background with six of its colours on it. */
function Chip({ entry }: { entry: Entry }) {
  if (entry.id === null) {
    return (
      <span
        aria-hidden
        className="flex h-5 w-14 shrink-0 overflow-hidden rounded border"
      >
        <span className="flex-1 bg-[#eff1f5]" />
        <span className="flex-1 bg-[#1e1e2e]" />
      </span>
    );
  }
  const [bg, fg, ...rest] = entry.colors;
  const hues = HUES.map((name, i) => ({ name, color: rest[i] }));
  return (
    <span
      aria-hidden
      className="flex h-5 w-14 shrink-0 items-center gap-[3px] rounded border px-1"
      style={{ background: bg }}
    >
      <span
        className="font-mono text-[10px] leading-none font-bold"
        style={{ color: fg }}
      >
        &gt;
      </span>
      {hues.map((h) => (
        <span
          key={h.name}
          className="size-1.5 rounded-full"
          style={{ background: h.color }}
        />
      ))}
    </span>
  );
}
