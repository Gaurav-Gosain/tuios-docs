"use client";

import { Check, Copy, X } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FEED_PATH,
  type GalleryEntry,
  type GalleryFile,
  mergeEntries,
  parseFeed,
} from "@/lib/gallery/feed";
import { type SortMode, sortEntries } from "@/lib/gallery/votes";
import { ApplyCommand } from "./apply";
import { HighlightedCode } from "./highlight";
import {
  GithubVotes,
  HeartButton,
  type SiteVotes,
  useSiteVotes,
} from "./votes";

/**
 * The gallery grid. The seed comes with the page. The synced feed is read
 * from the site itself after the page loads, so a visit costs no GitHub API
 * call, and the page works the same when the feed is missing.
 *
 * Every string from a submission is drawn as a React text child, which
 * escapes it. Nothing here uses dangerouslySetInnerHTML.
 */
export function Gallery({
  seed,
  badge,
}: {
  seed: GalleryEntry[];
  /** The version badge of tuios look, made on the server. */
  badge?: ReactNode;
}) {
  const [synced, setSynced] = useState<GalleryEntry[]>([]);
  const [open, setOpen] = useState<GalleryEntry | null>(null);
  const [sort, setSort] = useState<SortMode>("top");
  const { votes, setCount } = useSiteVotes();

  useEffect(() => {
    const controller = new AbortController();
    fetch(FEED_PATH, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    })
      .then((res) =>
        res.ok && res.headers.get("content-type")?.includes("json")
          ? res.json()
          : null,
      )
      .then((json) => {
        if (json) setSynced(parseFeed(json));
      })
      // No feed yet, or offline: the seed is still shown.
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const merged = useMemo(() => mergeEntries(synced, seed), [synced, seed]);
  const entries = useMemo(
    () => sortEntries(merged, sort, votes.counts),
    [merged, sort, votes.counts],
  );

  // tuios.dev/r/<id> lands on /gallery#look-<id>. The synced entries arrive
  // after the page loads, so the card is looked for again when they do.
  useEffect(() => {
    const id = /^#look-([a-z0-9-]{1,40})$/.exec(window.location.hash)?.[1];
    if (!id) return;
    const entry = merged.find((e) => e.look?.id === id);
    if (!entry) return;
    document.getElementById(`look-${id}`)?.scrollIntoView({ block: "center" });
    setOpen(entry);
  }, [merged]);

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-fd-border border-dashed px-6 py-16 text-center">
        <p className="font-medium text-fd-foreground">No setups yet.</p>
        <p className="mt-2 text-fd-muted-foreground text-sm">
          Share your setup in the discussion. It can be the first entry here.
        </p>
      </div>
    );
  }

  return (
    <>
      <SortToggle sort={sort} setSort={setSort} />
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <li
            key={entry.id}
            id={entry.look ? `look-${entry.look.id}` : undefined}
            className="flex scroll-mt-24 flex-col overflow-hidden rounded-xl border border-fd-border bg-fd-card"
          >
            <button
              type="button"
              onClick={() => setOpen(entry)}
              className="group block overflow-hidden bg-fd-muted focus-visible:outline-2 focus-visible:outline-fd-primary focus-visible:-outline-offset-2"
              aria-label={`Open the setup by @${entry.login}`}
            >
              {/* biome-ignore lint/performance/noImgElement: a static export has no image optimiser, and the stills are WebP already */}
              <img
                src={entry.thumb}
                alt={`The tuios setup of @${entry.login}`}
                width={Math.min(entry.width, 800)}
                height={Math.round(
                  (entry.height * Math.min(entry.width, 800)) / entry.width,
                )}
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </button>
            <div className="flex flex-1 flex-col gap-3 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <Byline entry={entry} />
                {entry.files[0] ? (
                  <CopyFile file={entry.files[0]} compact />
                ) : null}
              </div>
              {entry.look ? (
                <ApplyCommand look={entry.look} badge={badge} />
              ) : null}
              <VoteRow entry={entry} votes={votes} setCount={setCount} />
            </div>
          </li>
        ))}
      </ul>
      <EntryDialog
        entry={open}
        onClose={() => setOpen(null)}
        badge={badge}
        votes={votes}
        setCount={setCount}
      />
    </>
  );
}

/** Top (GitHub reactions weigh three hearts) or New. */
function SortToggle({
  sort,
  setSort,
}: {
  sort: SortMode;
  setSort: (mode: SortMode) => void;
}) {
  const modes: [SortMode, string, string][] = [
    [
      "top",
      "Top",
      "Most votes first. A GitHub reaction counts as three likes.",
    ],
    ["new", "New", "Newest first."],
  ];
  return (
    <div className="mb-4 flex justify-end">
      {/* biome-ignore lint/a11y/useSemanticElements: a pair of toggle buttons reads better than a radio group here */}
      <div
        role="group"
        aria-label="Sort the setups"
        className="inline-flex rounded-lg border border-fd-border p-0.5 text-sm"
      >
        {modes.map(([mode, label, hint]) => (
          <button
            key={mode}
            type="button"
            title={hint}
            aria-pressed={sort === mode}
            onClick={() => setSort(mode)}
            className={`rounded-md px-3 py-1 transition-colors ${
              sort === mode
                ? "bg-fd-accent font-medium text-fd-foreground"
                : "text-fd-muted-foreground hover:text-fd-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function VoteRow({
  entry,
  votes,
  setCount,
}: {
  entry: GalleryEntry;
  votes: SiteVotes;
  setCount: (id: string, count: number) => void;
}) {
  return (
    <div className="-mx-1.5 mt-auto flex items-center gap-1">
      <HeartButton entry={entry} votes={votes} setCount={setCount} />
      {entry.github !== undefined ? (
        <>
          <span aria-hidden className="text-fd-muted-foreground text-xs">
            ·
          </span>
          <GithubVotes entry={entry} />
        </>
      ) : null}
    </div>
  );
}

function Byline({ entry }: { entry: GalleryEntry }) {
  return (
    <p className="min-w-0 text-sm">
      {entry.title ? (
        <span className="font-mono text-fd-foreground">
          {entry.title}
          <span className="text-fd-muted-foreground">{" · "}</span>
        </span>
      ) : null}
      <a
        href={entry.url}
        target="_blank"
        rel="nofollow ugc noopener"
        className="font-medium text-fd-foreground underline decoration-fd-primary/40 underline-offset-4 hover:decoration-fd-primary"
      >
        @{entry.login}
      </a>
      <span className="text-fd-muted-foreground">
        {" · "}
        <time dateTime={entry.date}>{formatDate(entry.date)}</time>
      </span>
    </p>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function copyLabel(file: GalleryFile) {
  return file.label === "theme" ? "Copy theme" : "Copy config";
}

function CopyFile({ file, compact }: { file: GalleryFile; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(file.text);
      setCopied(true);
    } catch {
      // No clipboard access. The text is in the dialog to select by hand.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={
        compact
          ? "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-fd-muted-foreground text-xs transition-colors hover:bg-fd-accent hover:text-fd-foreground"
          : "inline-flex shrink-0 items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-fd-foreground text-xs transition-colors hover:bg-fd-accent"
      }
    >
      {copied ? (
        <Check className="size-3.5 text-fd-primary" />
      ) : (
        <Copy className="size-3.5" />
      )}
      <span aria-live="polite">{copied ? "Copied" : copyLabel(file)}</span>
    </button>
  );
}

function EntryDialog({
  entry,
  onClose,
  badge,
  votes,
  setCount,
}: {
  entry: GalleryEntry | null;
  onClose: () => void;
  badge?: ReactNode;
  votes: SiteVotes;
  setCount: (id: string, count: number) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (entry && !dialog.open) dialog.showModal();
    if (!entry && dialog.open) dialog.close();
  }, [entry]);

  // A click on the backdrop lands on the dialog element itself.
  const onClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) onClose();
    },
    [onClose],
  );

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape closes a modal dialog natively
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={onClick}
      aria-label={entry ? `The setup by @${entry.login}` : undefined}
      className="m-auto max-h-[92dvh] w-[min(72rem,94vw)] overflow-hidden rounded-xl border border-fd-border bg-fd-background p-0 text-fd-foreground shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {entry ? (
        <div className="flex max-h-[92dvh] flex-col">
          <div className="flex items-center justify-between gap-3 border-fd-border border-b px-4 py-3">
            <Byline entry={entry} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="overflow-y-auto">
            <a
              href={entry.full}
              target="_blank"
              rel="noopener"
              className="block bg-fd-muted"
            >
              {/* biome-ignore lint/performance/noImgElement: see the grid */}
              <img
                src={entry.full}
                alt={`The tuios setup of @${entry.login}, full size`}
                width={entry.width}
                height={entry.height}
                decoding="async"
                className="h-auto w-full"
              />
            </a>
            <div className="flex flex-col gap-3 border-fd-border border-t px-4 py-3">
              {entry.look ? (
                <ApplyCommand look={entry.look} badge={badge} />
              ) : null}
              <VoteRow entry={entry} votes={votes} setCount={setCount} />
            </div>
            {entry.files.map((file) => (
              <section key={file.label} className="border-fd-border border-t">
                <div className="flex items-center justify-between gap-3 px-4 py-2">
                  <h2 className="font-mono text-fd-muted-foreground text-xs">
                    {file.label}
                  </h2>
                  <CopyFile file={file} />
                </div>
                <HighlightedCode file={file} />
              </section>
            ))}
            {entry.files.length === 0 ? (
              <p className="border-fd-border border-t px-4 py-3 text-fd-muted-foreground text-sm">
                This entry has no config.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
