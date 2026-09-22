'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * A model of how the tuios daemon resolves one pane's agent state from its
 * sources, checked against internal/session/agent_source.go, agent_state.go
 * and agent_screen.go. It keeps the parts that decide the permission prompt
 * case and leaves the rest out:
 *
 *   - ranks: report 40, transcript 35, osc 30, screen 20, detect 10, stall 0.
 *     A source may write over a claim ranked at or below its own.
 *   - the screen tier looks 400ms after the last output chunk (the settle
 *     scan), and again when the silence timer finds a stalled pane.
 *   - the visible-blocker exception: a screen rule matching needs_input takes
 *     a higher claim when the pane painted after that claim was stamped and
 *     the claim is at least 2s old. It remembers what it displaced and gives
 *     it back on the next look that finds no prompt.
 *   - the silence timer (30s default) demotes working. In the old model it
 *     writes idle. In the new model it asks the screen first, and writes
 *     unknown when the screen says nothing.
 *
 * The old mode is the first version: an explicit report, the foreground
 * process detector guarded by one ownership bool, and the silence timer.
 * Escape codes, screen rules and the transcript were not read at all.
 */

type State = 'none' | 'working' | 'needs_input' | 'idle' | 'unknown';
type Lane = 'report' | 'transcript' | 'osc' | 'screen' | 'process' | 'stall';
type Mode = 'old' | 'new';
type EventKind =
  | 'start'
  | 'report'
  | 'transcript'
  | 'osc'
  | 'prompt'
  | 'answer'
  | 'silence2'
  | 'silence30'
  | 'exit';

const LANES: { id: Lane; label: string; rank: number }[] = [
  { id: 'report', label: 'report', rank: 40 },
  { id: 'transcript', label: 'transcript', rank: 35 },
  { id: 'osc', label: 'OSC', rank: 30 },
  { id: 'screen', label: 'screen', rank: 20 },
  { id: 'process', label: 'process', rank: 10 },
  { id: 'stall', label: 'stall', rank: 0 },
];

const RANK: Record<Lane, number> = Object.fromEntries(
  LANES.map((l) => [l.id, l.rank]),
) as Record<Lane, number>;

const OLD_READS: Record<Lane, boolean> = {
  report: true,
  transcript: false,
  osc: false,
  screen: false,
  process: true,
  stall: true,
};

const GLYPH: Record<State, string> = {
  none: '',
  working: '●',
  needs_input: '▲',
  idle: '○',
  unknown: '□',
};

const EVENTS: { kind: EventKind; label: string }[] = [
  { kind: 'start', label: 'agent starts' },
  { kind: 'report', label: 'agent reports working' },
  { kind: 'transcript', label: 'transcript record' },
  { kind: 'osc', label: 'progress bar (OSC 9;4)' },
  { kind: 'prompt', label: 'prompt painted' },
  { kind: 'silence2', label: 'silence 2s' },
  { kind: 'silence30', label: 'silence 30s' },
  { kind: 'answer', label: 'you answer' },
  { kind: 'exit', label: 'agent exits' },
];

const SHORT: Record<EventKind, string> = {
  start: 'start',
  report: 'hook',
  transcript: 'rec',
  osc: 'OSC',
  prompt: 'ask',
  answer: 'reply',
  silence2: '+2s',
  silence30: '+30s',
  exit: 'exit',
};

const LABEL = Object.fromEntries(EVENTS.map((e) => [e.kind, e.label])) as Record<EventKind, string>;

const PRESETS: { label: string; events: EventKind[] }[] = [
  {
    label: 'Permission prompt, agent with a hook',
    events: ['start', 'report', 'silence2', 'prompt', 'silence30', 'answer', 'exit'],
  },
  {
    label: 'Permission prompt, no hook',
    events: ['start', 'transcript', 'silence2', 'prompt', 'silence30', 'answer'],
  },
];

const MAX_STEPS = 9;
const STALL = 30;
const GRACE = 2;
const SETTLE = 0.4;

type CellMark = 'owner' | 'refused' | 'held' | 'empty' | 'unread';

interface Step {
  kind: EventKind;
  t: number;
  resolved: State;
  owner: Lane | null;
  lanes: Record<Lane, { state: State; mark: CellMark }>;
  note: string;
  alert: boolean;
}

interface Sim {
  t: number;
  state: State;
  stateAt: number;
  owner: Lane | null;
  prior: { owner: Lane | null; state: State } | null;
  opinions: Record<Lane, State>;
  lastOutput: number;
  lastPaint: number;
  promptVisible: boolean;
  running: boolean;
}

function fmt(t: number): string {
  return `${Number.isInteger(t) ? t : t.toFixed(1)}s`;
}

function stateName(s: State): string {
  return s === 'needs_input' ? 'needs_input' : s;
}

function simulate(events: EventKind[], mode: Mode): Step[] {
  const sim: Sim = {
    t: 0,
    state: 'none',
    stateAt: 0,
    owner: null,
    prior: null,
    opinions: {
      report: 'none',
      transcript: 'none',
      osc: 'none',
      screen: 'none',
      process: 'none',
      stall: 'none',
    },
    lastOutput: 0,
    lastPaint: 0,
    promptVisible: false,
    running: false,
  };
  const steps: Step[] = [];

  for (const kind of events) {
    const refused = new Set<Lane>();
    const notes: string[] = [];
    const before = sim.state;

    const accept = (lane: Lane, state: State) => {
      sim.state = state;
      sim.stateAt = sim.t;
      sim.owner = lane;
    };

    // write is ApplyAgentReport: the ranking, plus the one exception.
    const write = (lane: Lane, state: State): boolean => {
      sim.opinions[lane] = state;
      if (mode === 'old') {
        if (!OLD_READS[lane]) {
          notes.push(`Nothing read the ${lane} channel yet, so this changed nothing.`);
          return false;
        }
        if (lane === 'process' && sim.state !== 'none') {
          refused.add(lane);
          notes.push('The detector only promotes a pane with no state.');
          return false;
        }
        accept(lane, state);
        return true;
      }
      if (sim.owner === null || RANK[lane] >= RANK[sim.owner]) {
        if (lane === 'screen' && sim.owner !== 'screen') {
          sim.prior = { owner: sim.owner, state: sim.state };
        }
        accept(lane, state);
        return true;
      }
      if (
        lane === 'screen' &&
        state === 'needs_input' &&
        sim.state !== 'needs_input'
      ) {
        const age = sim.t - sim.stateAt;
        const painted = sim.lastPaint > sim.stateAt;
        if (painted && age >= GRACE) {
          sim.prior = { owner: sim.owner, state: sim.state };
          notes.push(
            `The ${sim.owner} claim is ${fmt(age)} old and the pane painted over it, so the visible prompt takes it and remembers ${sim.owner}: ${stateName(sim.state)}.`,
          );
          accept(lane, state);
          return true;
        }
        refused.add(lane);
        notes.push(
          painted
            ? `The ${sim.owner} claim is only ${fmt(age)} old. A hook gets ${GRACE}s to describe the new screen first.`
            : `The pane has not painted since the ${sim.owner} claim.`,
        );
        return false;
      }
      refused.add(lane);
      notes.push(`${lane} ranks below ${sim.owner}, which still holds the pane.`);
      return false;
    };

    // look is the screen tier: read the bottom of the pane, match the rules.
    const look = (): boolean => {
      if (mode === 'old') return false;
      if (!sim.running) return false;
      if (sim.promptVisible) {
        notes.push('A screen rule matched the prompt.');
        write('screen', 'needs_input');
        return true;
      }
      sim.opinions.screen = 'none';
      if (sim.owner === 'screen' && sim.prior) {
        const p = sim.prior;
        sim.state = p.state;
        sim.owner = p.owner;
        sim.stateAt = sim.t;
        sim.prior = null;
        notes.push(
          `The prompt is gone, so the screen hands the pane back to ${p.owner ?? 'nobody'}: ${stateName(p.state)}.`,
        );
      }
      return false;
    };

    const stallCheck = () => {
      if (sim.state !== 'working') return;
      const since = Math.max(sim.lastOutput, sim.stateAt);
      if (sim.t - since < STALL) return;
      if (mode === 'new' && look()) {
        notes.push(`The silence timer looked first. The screen answered, so it left the pane alone.`);
        return;
      }
      const quiet: State = mode === 'old' ? 'idle' : 'unknown';
      sim.opinions.stall = quiet;
      sim.state = quiet;
      sim.stateAt = sim.t;
      sim.owner = 'stall';
      notes.push(
        mode === 'old'
          ? `No output for ${STALL}s, so the silence timer wrote idle. Alerts ignore idle.`
          : `No output for ${STALL}s and the screen said nothing, so the timer wrote unknown, not idle.`,
      );
    };

    switch (kind) {
      case 'start':
        sim.running = true;
        sim.lastOutput = sim.t;
        sim.lastPaint = sim.t;
        if (write('process', 'working')) notes.unshift('The detector saw an agent in the foreground.');
        break;
      case 'report':
        if (!sim.running) {
          notes.push('No agent is running.');
          break;
        }
        sim.lastOutput = sim.t;
        if (write('report', 'working')) notes.unshift('The hook reported working.');
        break;
      case 'transcript':
        if (!sim.running) {
          notes.push('No agent is running.');
          break;
        }
        if (write('transcript', 'working') && mode === 'new')
          notes.unshift('A record landed mid-turn, so the transcript says working.');
        break;
      case 'osc':
        if (!sim.running) {
          notes.push('No agent is running.');
          break;
        }
        sim.lastOutput = sim.t;
        sim.lastPaint = sim.t;
        if (write('osc', 'working') && mode === 'new')
          notes.unshift('The harness drew a progress bar, which means working.');
        break;
      case 'prompt':
        if (!sim.running) {
          notes.push('No agent is running.');
          break;
        }
        sim.promptVisible = true;
        sim.lastOutput = sim.t;
        sim.lastPaint = sim.t;
        sim.t += SETTLE;
        if (mode === 'old') {
          notes.push('The prompt is on the screen, and nothing reads the screen.');
        } else {
          notes.push(`The settle scan ran ${SETTLE * 1000}ms after the last chunk.`);
          look();
        }
        break;
      case 'answer':
        if (!sim.running) {
          notes.push('No agent is running.');
          break;
        }
        sim.promptVisible = false;
        sim.lastOutput = sim.t;
        sim.lastPaint = sim.t;
        sim.t += SETTLE;
        if (mode === 'old') {
          notes.push('Output resumes. The silence timer never promotes a pane back to working.');
        } else if (!look()) {
          if (notes.length === 0) notes.push('Output resumes. No rule matches the screen.');
        }
        break;
      case 'silence2':
        sim.t += 2;
        notes.push('Nothing arrives on any channel.');
        stallCheck();
        break;
      case 'silence30':
        sim.t += 30;
        notes.push('Nothing arrives on any channel.');
        stallCheck();
        break;
      case 'exit':
        sim.running = false;
        sim.promptVisible = false;
        sim.state = 'none';
        sim.owner = null;
        sim.prior = null;
        for (const l of LANES) sim.opinions[l.id] = 'none';
        notes.push('The shell is back in the foreground, so the pane clears.');
        break;
    }

    const lanes = {} as Step['lanes'];
    for (const l of LANES) {
      const state = sim.opinions[l.id];
      let mark: CellMark = state === 'none' ? 'empty' : 'held';
      if (mode === 'old' && !OLD_READS[l.id]) mark = 'unread';
      else if (refused.has(l.id)) mark = 'refused';
      else if (sim.owner === l.id && state !== 'none') mark = 'owner';
      lanes[l.id] = { state, mark };
    }

    steps.push({
      kind,
      t: sim.t,
      resolved: sim.state,
      owner: sim.owner,
      lanes,
      note: notes.join(' '),
      alert: sim.state === 'needs_input' && before !== 'needs_input',
    });
  }
  return steps;
}

export function AgentSourceTimeline() {
  const [events, setEvents] = useState<EventKind[]>(PRESETS[0].events);
  const [mode, setMode] = useState<Mode>('new');
  const [selected, setSelected] = useState<number | null>(null);

  const steps = useMemo(() => simulate(events, mode), [events, mode]);
  const current = selected !== null && selected < steps.length ? selected : steps.length - 1;
  const step: Step | undefined = steps[current];
  const full = events.length >= MAX_STEPS;

  const alerts = steps.filter((s) => s.alert).length;
  // Steps where a prompt is on the screen: after a prompt event, before an
  // answer or an exit.
  const promptSteps = steps.filter((_step, i) => {
    let visible = false;
    for (let j = 0; j <= i; j++) {
      if (events[j] === 'prompt') visible = true;
      if (events[j] === 'answer' || events[j] === 'exit') visible = false;
    }
    return visible;
  });
  const blockedShown = promptSteps.filter((s) => s.resolved === 'needs_input').length;

  const add = (kind: EventKind) => {
    if (full) return;
    setEvents((e) => [...e, kind]);
    setSelected(null);
  };

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-fd-border px-4 py-3">
        <span className="mr-1 text-xs text-fd-muted-foreground">resolve with</span>
        <fieldset className="inline-flex overflow-hidden rounded-md border border-fd-border">
          <legend className="sr-only">Resolution model</legend>
          {(
            [
              ['old', 'single bool (old)'],
              ['new', 'ranked + visible blocker'],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                'px-2.5 py-1 text-xs',
                mode === m
                  ? 'bg-fd-primary text-fd-primary-foreground'
                  : 'text-fd-muted-foreground hover:bg-fd-muted',
              )}
            >
              {label}
            </button>
          ))}
        </fieldset>
      </div>

      <div className="px-2 pt-3 sm:px-4">
        <table className="w-full table-fixed border-separate border-spacing-0.5 font-mono text-xs">
          <caption className="sr-only">
            Each column is one event. Each row is one source of agent state, in rank order. The top row is the state the
            rail shows.
          </caption>
          <colgroup>
            <col className="w-[4.75rem] sm:w-24" />
            {steps.map((_, i) => (
              <col key={i} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="text-left text-[10px] font-normal text-fd-muted-foreground">
                event
              </th>
              {steps.map((s, i) => (
                <th key={i} scope="col" className="p-0 font-normal">
                  <button
                    type="button"
                    onClick={() => setSelected(i)}
                    aria-pressed={i === current}
                    aria-label={`Step ${i + 1}: ${LABEL[s.kind]} at ${fmt(s.t)}`}
                    className={cn(
                      'flex w-full flex-col items-center rounded px-0 py-1 leading-tight',
                      i === current ? 'bg-fd-muted text-fd-foreground' : 'text-fd-muted-foreground hover:bg-fd-muted/60',
                    )}
                  >
                    <span className="max-w-full truncate text-[10px]">{SHORT[s.kind]}</span>
                    <span className="text-[9px] opacity-70">{fmt(s.t)}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="text-left text-[11px] font-semibold text-fd-foreground">
                rail
              </th>
              {steps.map((s, i) => (
                <td
                  key={i}
                  className={cn(
                    'h-8 rounded text-center text-base leading-none',
                    s.resolved === 'needs_input'
                      ? 'bg-fd-primary/20 text-fd-primary'
                      : 'bg-fd-muted/70 text-fd-foreground',
                  )}
                  title={s.resolved}
                >
                  <span aria-hidden="true" className={s.resolved === 'none' ? 'text-fd-muted-foreground/40' : undefined}>
                    {s.resolved === 'none' ? '·' : GLYPH[s.resolved]}
                  </span>
                  <span className="sr-only">{s.resolved}</span>
                </td>
              ))}
            </tr>
            {LANES.map((lane) => {
              const unread = mode === 'old' && !OLD_READS[lane.id];
              return (
                <tr key={lane.id}>
                  <th
                    scope="row"
                    className={cn(
                      'text-left text-[10px] font-normal sm:text-[11px]',
                      unread ? 'text-fd-muted-foreground/50' : 'text-fd-muted-foreground',
                    )}
                  >
                    {lane.label}
                    <span className="ml-1 hidden opacity-60 sm:inline">{lane.rank}</span>
                  </th>
                  {steps.map((s, i) => {
                    const c = s.lanes[lane.id];
                    return (
                      <td
                        key={i}
                        title={`${lane.label}: ${c.state}${c.mark === 'refused' ? ' (refused)' : ''}`}
                        className={cn(
                          'h-6 rounded text-center leading-none motion-safe:transition-colors',
                          c.mark === 'owner' && 'bg-fd-primary/15 text-fd-foreground ring-1 ring-inset ring-fd-primary/50',
                          c.mark === 'held' && 'text-fd-muted-foreground',
                          c.mark === 'refused' && 'text-fd-muted-foreground line-through decoration-fd-primary',
                          c.mark === 'empty' && 'text-fd-muted-foreground/30',
                          c.mark === 'unread' && 'bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,var(--color-fd-border)_3px,var(--color-fd-border)_4px)] text-fd-muted-foreground/40',
                        )}
                      >
                        <span aria-hidden="true">
                          {c.mark === 'refused' ? `${GLYPH[c.state]}` : c.state === 'none' ? '·' : GLYPH[c.state]}
                        </span>
                        <span className="sr-only">
                          {c.mark === 'unread' ? 'not read' : `${c.state}${c.mark === 'owner' ? ', holds the pane' : ''}${c.mark === 'refused' ? ', refused' : ''}`}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mx-2 mt-3 rounded-md bg-fd-muted/50 px-3 py-2 text-sm sm:mx-4" aria-live="polite">
        {step ? (
          <>
        <div className="font-mono text-xs text-fd-muted-foreground">
          step {current + 1}, {LABEL[step.kind]} at {fmt(step.t)}: rail shows{' '}
          <span className={step.resolved === 'needs_input' ? 'text-fd-primary' : 'text-fd-foreground'}>
            {step.resolved}
          </span>
          {step.owner ? `, held by ${step.owner}` : ''}
          {step.alert ? ', alert raised' : ''}
        </div>
        <p className="mt-1 text-fd-foreground">{step.note || 'Nothing changed.'}</p>
          </>
        ) : (
          <p className="text-fd-muted-foreground">No events yet. Add one below.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 px-2 pt-3 sm:px-4">
        {EVENTS.map((e) => (
          <button
            key={e.kind}
            type="button"
            disabled={full}
            onClick={() => add(e.kind)}
            className="rounded-md border border-fd-border px-2 py-1 text-xs text-fd-foreground hover:bg-fd-muted disabled:opacity-40"
          >
            + {e.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 px-2 pt-2 pb-3 sm:px-4">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setEvents(p.events);
              setSelected(null);
            }}
            className="rounded-md bg-fd-muted px-2 py-1 text-xs text-fd-foreground hover:bg-fd-muted/70"
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setEvents([]);
            setSelected(null);
          }}
          className="rounded-md px-2 py-1 text-xs text-fd-muted-foreground hover:bg-fd-muted"
        >
          clear
        </button>
        {full ? <span className="text-xs text-fd-muted-foreground">{MAX_STEPS} steps is the limit here</span> : null}
      </div>

      <div className="border-t border-fd-border px-4 py-2 font-mono text-xs text-fd-muted-foreground">
        prompt on screen for {promptSteps.length} step{promptSteps.length === 1 ? '' : 's'}, rail said needs_input for{' '}
        <span className={blockedShown === 0 && promptSteps.length > 0 ? 'text-fd-primary' : 'text-fd-foreground'}>
          {blockedShown}
        </span>
        , alerts raised: {alerts}
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        One pane, six sources in rank order. A boxed cell holds the pane; a struck cell was refused. ● working, ▲
        needs_input, ○ idle, □ unknown. Switch to the old model and watch the rail sit on working through the prompt,
        then fall to idle. The model follows the daemon&apos;s rules: a {SETTLE * 1000}ms settle scan after the last
        chunk, a {GRACE}s grace before a visible prompt can take a higher claim, and the {STALL}s default silence timer.
      </figcaption>
    </figure>
  );
}
