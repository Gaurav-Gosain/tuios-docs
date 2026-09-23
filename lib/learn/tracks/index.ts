/**
 * Every track, in the order the /learn page lists them. Keys 1 to 9 pick
 * them in this order. To add a track, write it next to these and add it here.
 */
import type { Track } from "../types";
import { agents } from "./agents";
import { automation } from "./automation";
import { basics } from "./basics";
import { fromTmux } from "./from-tmux";
import { fromZellij } from "./from-zellij";
import { layouts } from "./layouts";
import { makeItYours } from "./make-it-yours";
import { powerMoves } from "./power-moves";
import { workspaces } from "./workspaces";

export const tracks: Track[] = [
  basics,
  fromTmux,
  fromZellij,
  layouts,
  workspaces,
  powerMoves,
  makeItYours,
  agents,
  automation,
];

export function findTrack(id: string | null | undefined) {
  return tracks.find((t) => t.id === id) ?? null;
}
