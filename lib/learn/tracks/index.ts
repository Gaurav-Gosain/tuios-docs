/**
 * Every track, in the order the /learn page lists them. Keys 1 to 9 pick
 * them in this order. To add a track, write it next to these and add it here.
 */
import type { Track } from "../types";
import { basics } from "./basics";
import { fromTmux } from "./from-tmux";

export const tracks: Track[] = [basics, fromTmux];

export function findTrack(id: string | null | undefined) {
  return tracks.find((t) => t.id === id) ?? null;
}
