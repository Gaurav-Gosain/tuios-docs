/**
 * Progress on each track, kept in localStorage. Every read and write is
 * wrapped: private windows and blocked storage throw, and the page works the
 * same without it, it just forgets.
 */

const KEY = "tuios-learn-v1";

export type TrackProgress = {
  /** Steps done, by id. */
  done: string[];
  /** Best time in seconds, for a finished track. */
  best?: number;
  finished?: boolean;
};

export type Progress = Record<string, TrackProgress>;

export function readProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function write(progress: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Storage is off. Progress lives for this visit only.
  }
}

export function markStep(trackId: string, stepId: string) {
  const all = readProgress();
  const track = all[trackId] ?? { done: [] };
  if (!track.done.includes(stepId)) track.done = [...track.done, stepId];
  all[trackId] = track;
  write(all);
  return all;
}

export function markFinished(trackId: string, seconds: number) {
  const all = readProgress();
  const track = all[trackId] ?? { done: [] };
  track.finished = true;
  track.best = track.best ? Math.min(track.best, seconds) : seconds;
  all[trackId] = track;
  write(all);
  return all;
}
