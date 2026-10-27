/**
 * Every track, in the order the /learn page lists them. Keys 1 to 9 pick the
 * first nine in this order. To add a track, write it next to these, give it
 * a group, and add it here in its group's place.
 */
import type { Track, TrackGroup } from "../types";
import { agents } from "./agents";
import { automation } from "./automation";
import { basics } from "./basics";
import { fromTmux } from "./from-tmux";
import { fromZellij } from "./from-zellij";
import { layouts } from "./layouts";
import { makeItYours } from "./make-it-yours";
import { paneTricks } from "./pane-tricks";
import { powerMoves } from "./power-moves";
import { sessions } from "./sessions";
import { workspaces } from "./workspaces";
import { yourKeys } from "./your-keys";

/** The hub's groups, in order, with their headings. */
export const trackGroups: { id: TrackGroup; title: string }[] = [
  { id: "start", title: "Start here" },
  { id: "everyday", title: "Every day" },
  { id: "agents", title: "Agents" },
  { id: "build", title: "Build and ship" },
  { id: "yours", title: "Make it yours" },
];

export const tracks: Track[] = [
  basics,
  fromTmux,
  fromZellij,
  layouts,
  workspaces,
  powerMoves,
  paneTricks,
  agents,
  automation,
  yourKeys,
  makeItYours,
  sessions,
];

export function findTrack(id: string | null | undefined) {
  return tracks.find((t) => t.id === id) ?? null;
}
