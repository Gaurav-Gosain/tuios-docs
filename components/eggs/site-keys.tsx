"use client";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { usePathname, useRouter } from "next/navigation";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { OPEN_EVENT } from "@/lib/site-themes/store";

// Tilly's visit loads only when someone enters the code.
const TillyPeek = lazy(() => import("./tilly-peek"));

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

type Binding = { key: string; label: string; run: () => void };

/**
 * Keys that leave the page alone: in a field, in a live terminal
 * (role="application"), or already handled by something else.
 */
function ignored(e: KeyboardEvent) {
  if (e.defaultPrevented || e.isComposing) return true;
  const el = e.target as HTMLElement | null;
  if (!el || !(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  if (
    el.closest(
      "input, textarea, select, dialog, [role=dialog], [role=application]",
    )
  )
    return true;
  return false;
}

/**
 * The site's own prefix key. Ctrl+B, as in tuios, shows the keys the site
 * answers to, and the next key runs one. The Konami code brings Tilly.
 * Neither runs on /learn, where Ctrl+B belongs to the tuios in the page.
 */
export function SiteKeys() {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenSearch } = useSearchContext();
  const [prefix, setPrefix] = useState(false);
  const [tilly, setTilly] = useState(0);
  const typed = useRef<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const off = pathname?.startsWith("/learn") ?? false;

  const bindings: Binding[] = [
    { key: "h", label: "Home", run: () => router.push("/") },
    { key: "d", label: "Docs", run: () => router.push("/docs") },
    { key: "l", label: "Learn tuios", run: () => router.push("/learn") },
    { key: "b", label: "Blog", run: () => router.push("/blog") },
    { key: "r", label: "Releases", run: () => router.push("/releases") },
    { key: "g", label: "Gallery", run: () => router.push("/gallery") },
    { key: "s", label: "Search", run: () => setOpenSearch(true) },
    {
      key: "t",
      label: "Themes",
      run: () => window.dispatchEvent(new Event(OPEN_EVENT)),
    },
  ];
  const latest = useRef(bindings);
  latest.current = bindings;
  // The listener reads the prefix state without being added again each key.
  const prefixRef = useRef(false);
  prefixRef.current = prefix;

  useEffect(() => {
    if (off) return;
    const onKey = (e: KeyboardEvent) => {
      if (ignored(e)) return;

      if (prefixRef.current) {
        if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) return;
        e.preventDefault();
        setPrefix(false);
        const b = latest.current.find((x) => x.key === e.key);
        b?.run();
        return;
      }

      if (
        e.ctrlKey &&
        !e.altKey &&
        !e.metaKey &&
        !e.shiftKey &&
        e.key.toLowerCase() === "b"
      ) {
        e.preventDefault();
        setPrefix(true);
        return;
      }

      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      typed.current = [...typed.current, k].slice(-KONAMI.length);
      if (typed.current.join() === KONAMI.join()) {
        typed.current = [];
        setTilly((n) => n + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [off]);

  // The prefix gives up after a while, as tuios does.
  useEffect(() => {
    if (!prefix) return;
    timer.current = setTimeout(() => setPrefix(false), 4000);
    const leave = () => setPrefix(false);
    window.addEventListener("pointerdown", leave);
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener("pointerdown", leave);
    };
  }, [prefix]);

  return (
    <>
      {prefix && (
        <section
          aria-label="Site keys"
          aria-live="polite"
          className="fixed inset-x-2 bottom-2 z-50 mx-auto max-w-md rounded-xl border bg-fd-popover/95 p-3 font-mono text-sm text-fd-popover-foreground shadow-2xl backdrop-blur sm:inset-x-auto sm:right-4 sm:bottom-4 motion-safe:animate-[tt-in_140ms_ease-out]"
        >
          <p className="mb-2 flex items-center gap-2 text-xs text-fd-muted-foreground">
            <kbd className="keycap">Ctrl+B</kbd>
            <span>then a key</span>
            <span className="ms-auto">Esc to cancel</span>
          </p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
            {bindings.map((b) => (
              <li key={b.key} className="flex items-center gap-2">
                <kbd className="keycap">{b.key}</kbd>
                <span className="truncate">{b.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-fd-muted-foreground">
            The same prefix drives tuios.{" "}
            <a href="/docs/keybindings" className="underline">
              See its keys
            </a>
          </p>
        </section>
      )}
      {tilly > 0 && (
        <Suspense fallback={null}>
          <TillyPeek key={tilly} onDone={() => setTilly(0)} />
        </Suspense>
      )}
    </>
  );
}
