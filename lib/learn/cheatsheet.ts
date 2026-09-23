/**
 * The free play cheat sheet: the keys worth knowing, grouped, each one
 * playable into the live tuios with a click. Every key here is a default
 * from tuios's internal/config/userconfig.go.
 */
import type { KeyItem } from "./types";

export type CheatRow = {
  keys: KeyItem[];
  label: string;
  /** The mode the keys work in. Clicking the row switches to it first. */
  needs?: "window" | "terminal";
};

export type CheatGroup = { title: string; rows: CheatRow[] };

export const cheatsheet: CheatGroup[] = [
  {
    title: "Window mode",
    rows: [
      { keys: ["n"], label: "new window", needs: "window" },
      { keys: ["i"], label: "type in it", needs: "window" },
      { keys: ["tab"], label: "next window", needs: "window" },
      { keys: ["z"], label: "zoom", needs: "window" },
      { keys: ["x"], label: "close", needs: "window" },
      { keys: ["t"], label: "tiling on or off", needs: "window" },
      { keys: ["?"], label: "every key", needs: "window" },
    ],
  },
  {
    title: "Leader key, any mode",
    rows: [
      { keys: ["ctrl+b", "esc"], label: "window mode" },
      { keys: ["ctrl+b", "c"], label: "new window" },
      { keys: ["ctrl+b", "|"], label: "split right" },
      { keys: ["ctrl+b", "-"], label: "split down" },
      { keys: ["ctrl+b", "left"], label: "move focus" },
      { keys: ["ctrl+b", "["], label: "copy mode" },
      { keys: ["ctrl+b", "s"], label: "old commands" },
    ],
  },
  {
    title: "Layouts",
    rows: [
      { keys: ["alt+j", "n"], label: "open below", needs: "window" },
      { keys: ["R"], label: "rotate split", needs: "window" },
      { keys: ["H"], label: "swap left", needs: "window" },
      { keys: [">"], label: "grow", needs: "window" },
      { keys: ["h"], label: "focus or snap left", needs: "window" },
    ],
  },
  {
    title: "Workspaces",
    rows: [
      { keys: ["ctrl+b", "w", "2"], label: "go to 2" },
      { keys: ["alt+1"], label: "back to 1" },
      { keys: ["ctrl+b", "w", "#"], label: "send window to 3" },
      { keys: ["ctrl+b", "W"], label: "see them all" },
      { keys: ["ctrl+b", "b"], label: "the rail" },
    ],
  },
  {
    title: "Find anything",
    rows: [
      { keys: ["ctrl+p"], label: "command palette" },
      { keys: ["ctrl+b", "a"], label: "launch a program" },
      { keys: ["ctrl+b", ","], label: "settings" },
      { keys: ["ctrl+b", "D", "k"], label: "show my keys" },
      { keys: ["S"], label: "screen saver", needs: "window" },
    ],
  },
];

/** Things to run in the fake shell. */
export const shellIdeas: { line: string; label: string }[] = [
  { line: "neofetch", label: "say hi" },
  { line: "claude", label: "a pretend agent" },
  { line: "tuios tape play party.tape", label: "tuios drives itself" },
  { line: "rain", label: "digital rain" },
  { line: "top", label: "live processes" },
  { line: "cd projects/hello && git log", label: "a real-ish repo" },
];
