/**
 * Small UI sounds for /learn, made with Web Audio at play time so there are
 * no sample files. Quiet by default, silent until the reader has pressed a
 * key or clicked (browsers refuse audio before that anyway), and off when the
 * reader mutes it. The choice is remembered.
 */
import type { TillySound } from "./tilly";

export type SoundName =
  | Exclude<TillySound, "none">
  | "tickWindow"
  | "tickTerminal";

/** Overall loudness, 0 to 1. Kept low: these sit under the reader's music. */
const VOLUME = 0.16;

type Note = {
  /** Hz, and an optional Hz to glide to. */
  freq: number;
  to?: number;
  /** Seconds after the sound starts. */
  at: number;
  dur: number;
  gain: number;
  type?: OscillatorType;
};

/** The notes of each sound. Exported for the tests. */
export const SOUNDS: Record<SoundName, Note[]> = {
  // Two rising notes, a fifth apart.
  chime: [
    { freq: 1046.5, at: 0, dur: 0.22, gain: 0.5, type: "triangle" },
    { freq: 1568, at: 0.07, dur: 0.32, gain: 0.45, type: "sine" },
  ],
  // A C major arpeggio that lands on a held chord.
  fanfare: [
    { freq: 523.25, at: 0, dur: 0.18, gain: 0.45, type: "triangle" },
    { freq: 659.25, at: 0.11, dur: 0.18, gain: 0.45, type: "triangle" },
    { freq: 783.99, at: 0.22, dur: 0.18, gain: 0.45, type: "triangle" },
    { freq: 1046.5, at: 0.33, dur: 0.7, gain: 0.4, type: "triangle" },
    { freq: 1318.5, at: 0.33, dur: 0.7, gain: 0.22, type: "sine" },
    { freq: 783.99, at: 0.33, dur: 0.7, gain: 0.22, type: "sine" },
  ],
  // Tilly talking: a short upward chirp.
  blip: [
    { freq: 620, to: 900, at: 0, dur: 0.07, gain: 0.35, type: "sine" },
    { freq: 760, to: 1020, at: 0.08, dur: 0.06, gain: 0.25, type: "sine" },
  ],
  // A soft falling pair, a question more than an alarm.
  nudge: [
    { freq: 587.33, at: 0, dur: 0.16, gain: 0.35, type: "sine" },
    { freq: 440, at: 0.14, dur: 0.26, gain: 0.3, type: "sine" },
  ],
  // Mode ticks: higher going into window mode, lower into typing.
  tickWindow: [
    { freq: 1400, to: 1800, at: 0, dur: 0.035, gain: 0.25, type: "square" },
  ],
  tickTerminal: [
    { freq: 900, to: 700, at: 0, dur: 0.035, gain: 0.25, type: "square" },
  ],
};

const MUTE_KEY = "tuios-learn-sound";
const HIDE_KEY = "tuios-learn-tilly";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the choice lasts for this visit only.
  }
}

export type LearnPrefs = { muted: boolean; tillyHidden: boolean };

const server: LearnPrefs = { muted: false, tillyHidden: false };
let prefs: LearnPrefs | null = null;
const listeners = new Set<() => void>();

/** The reader's sound and Tilly choices. Stable between changes. */
export function getPrefs(): LearnPrefs {
  if (prefs === null) {
    prefs = {
      muted: read(MUTE_KEY) === "off",
      tillyHidden: read(HIDE_KEY) === "hidden",
    };
  }
  return prefs;
}

export function getServerPrefs(): LearnPrefs {
  return server;
}

export function subscribePrefs(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function setPrefs(change: Partial<LearnPrefs>) {
  prefs = { ...getPrefs(), ...change };
  write(MUTE_KEY, prefs.muted ? "off" : null);
  write(HIDE_KEY, prefs.tillyHidden ? "hidden" : null);
  for (const fn of listeners) fn();
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let armed = false;

/**
 * Wait for the reader's first key or click, then make the audio context.
 * Until then every sound is dropped rather than queued, so nothing plays
 * late. Safe to call many times.
 */
export function armAudio() {
  if (armed || typeof window === "undefined") return;
  armed = true;
  const unlock = () => {
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = VOLUME;
      master.connect(ctx.destination);
      ctx.resume().catch(() => undefined);
    } catch {
      ctx = null;
    }
  };
  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
}

/** Play a sound now, unless muted or the reader has not interacted yet. */
export function playSound(name: SoundName | "none") {
  if (name === "none" || !ctx || !master || getPrefs().muted) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => undefined);
  const start = ctx.currentTime + 0.01;
  for (const n of SOUNDS[name]) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = n.type ?? "sine";
    const t0 = start + n.at;
    const t1 = t0 + n.dur;
    osc.frequency.setValueAtTime(n.freq, t0);
    if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, t1);
    // A quick attack and an exponential tail, so nothing clicks.
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(n.gain, t0 + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, t1);
    osc.connect(env);
    env.connect(master);
    osc.start(t0);
    osc.stop(t1 + 0.02);
  }
}
