/**
 * The tracks of /learn, read from lessons.json: the document `tuios.lessons()`
 * returns in the tuios browser build at learn/TUIOS_REF. tuios keeps the
 * lessons as data in internal/learn/lessons and runs the only lesson engine,
 * so this file only reads them for the parts of the page that draw before the
 * wasm loads: the hub, the track cards, the metadata and the tests.
 *
 * lessons.json is generated. Refresh it with the engine:
 *   bun scripts/learn-engine.mjs <build-dir>
 * which copies the build's lessons.json here and refuses one whose sha256 is
 * not the one in the build's manifest.
 */
import doc from "./lessons.json";
import type { KeyItem } from "./types";

/** A rule that finishes a step. The engine in tuios reads it; the page never does. */
export type Rule = Record<string, unknown>;

/** A command the engine runs to set a scene. */
export type SetupEntry = {
  command: string;
  args?: string[];
  until?: Rule;
};

/**
 * A feature a browser tab cannot run, such as detaching or a second machine.
 * The step shows a short animation and a docs link, and is done when the
 * reader says they got it.
 */
export type Explainer = {
  art: string;
  body: string;
  href: string;
  linkText: string;
};

/** The words a step shows on one surface. */
type Words = { title?: string; note?: string; hint?: string };

/** One step, with the web's words already in place. */
export type Step = {
  id: string;
  title: string;
  note?: string;
  keys: KeyItem[];
  needs?: "window" | "terminal";
  hint: string;
  learned?: string;
  explainer?: Explainer;
  waiting?: string;
  try?: string;
};

/** The hub's groups, in the order it shows them. */
export type TrackGroup = "start" | "everyday" | "agents" | "build" | "yours";

export type Track = {
  id: string;
  title: string;
  /** One line on the track card. */
  blurb: string;
  /** Who it is for, shown as a small tag. */
  audience: string;
  minutes: number;
  group: TrackGroup;
  /** Tracks to suggest when this one is done. */
  next?: string[];
  /** What the engine runs before the first step, to set the scene. */
  setup?: SetupEntry[];
  /** The track's own coach lines, before the shared ones. */
  coach?: { greet?: string[]; finish?: string[] };
  steps: Step[];
};

/** The coach's shared lines, by moment. */
export type Coach = {
  greet: string[];
  finish: string[];
  hintedLead: string[];
  reactions: Record<string, string[]>;
  nudges: Record<string, string[]>;
  poke: string[];
};

type RawStep = Step & { web?: Words; terminal?: Words };
type RawTrack = Omit<Track, "steps"> & {
  surfaces?: string[];
  steps: RawStep[];
};
type Lessons = {
  version: number;
  groups: { id: TrackGroup; title: string }[];
  coach: Coach;
  tracks: RawTrack[];
};

const lessons = doc as unknown as Lessons;

/** A step as the web shows it: its `web` words over the shared ones. */
function webStep(raw: RawStep): Step {
  const { web, terminal: _terminal, ...step } = raw;
  return { ...step, ...web } as Step;
}

/** Every track ready for the web, in the order the hub lists them. */
export const tracks: Track[] = lessons.tracks
  .filter((t) => !t.surfaces || t.surfaces.includes("web"))
  .map(({ surfaces: _surfaces, ...t }) => ({
    ...t,
    steps: t.steps.map(webStep),
  }));

/** The hub's groups, in order, with their headings. */
export const trackGroups = lessons.groups;

/** The coach's shared lines. */
export const coach: Coach = lessons.coach;

export function findTrack(id: string | null | undefined) {
  return tracks.find((t) => t.id === id) ?? null;
}
