"use client";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { usePathname, useRouter } from "next/navigation";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { keySequences, quickClicks, TILLY_EVENT } from "@/lib/eggs/triggers";
import { OPEN_EVENT } from "@/lib/site-themes/store";

// Tilly's visit loads only when something brings Tilly in.
const TillyPeek = lazy(() => import("./tilly-peek"));

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
 * answers to, and the next key runs one. Tilly comes in on the word tilly,
 * the Konami code, three quick clicks on the logo, or TILLY_EVENT (the 404
 * shell sends it). The keys do not run on /learn, where Ctrl+B belongs to the
 * tuios in the page.
 */
export function SiteKeys() {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenSearch } = useSearchContext();
  const [prefix, setPrefix] = useState(false);
  const [tilly, setTilly] = useState(0);
  const typed = useRef(keySequences());
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
      if (typed.current.feed(e.key)) setTilly((n) => n + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [off]);

  // Three quick clicks on the logo. The listener only counts: it never stops
  // a click, so a single click goes home at once, as before.
  useEffect(() => {
    const clicks = quickClicks(3, 1000);
    const onClick = (e: MouseEvent) => {
      const el = e.target as Element | null;
      if (!el?.closest?.("[data-tilly-logo]")) return;
      if (clicks.click(e.timeStamp)) setTilly((n) => n + 1);
    };
    const onTilly = () => setTilly((n) => n + 1);
    document.addEventListener("click", onClick, true);
    window.addEventListener(TILLY_EVENT, onTilly);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(TILLY_EVENT, onTilly);
    };
  }, []);

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
          <p className="mt-1 text-xs text-fd-muted-foreground">
            psst: type <kbd>tilly</kbd>
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
