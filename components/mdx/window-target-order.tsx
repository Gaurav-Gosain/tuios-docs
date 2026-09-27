'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * How `-w` picks a window, ported from findWindowStateIndex in tuios
 * internal/session/session_ops.go and WindowIndexTarget beside it. The
 * attached client's resolveWindowTarget (internal/app/os_tape_executor.go)
 * uses the same order. Before commit 9bc09e1e a unique id prefix was tried
 * before the names; after it, the names come first. Titles are left out:
 * every pane here has a name, and a name is tried before a title in both
 * orders.
 */

type Order = 'before' | 'after';

interface Pane {
  name: string;
  id: string;
}

type Step = {
  rule: string;
  outcome: 'none' | 'match' | 'ambiguous' | 'skipped';
  detail: string;
};

type Resolution = { index: number; error: string; steps: Step[] };

// The six panes TestNarrowRailKeepsTheAgentNameBeforeItsHarness opens, in the
// order it opens them. The starting ids are fixed so the page renders the same
// on the server and in the browser, and one of them is the unlucky draw.
const START: Pane[] = [
  { name: 'deploy', id: '8906542f-2c1e-4b7a-9d03-5e61f0a4c8b2' },
  { name: 'migrate-billing', id: '3f0c9a71-6d4e-4e28-b1f5-0a97c2d6e413' },
  { name: 'db', id: 'a41e7d09-83b6-4c5f-9e2a-71d0f5b3c864' },
  { name: 'web', id: 'db57c3e8-19fa-4d06-8b7c-e2a4960f15d3' },
  { name: 'api', id: '6c2b8f14-a7d3-4091-b65e-3d8e01c9f7a2' },
  { name: 'ci', id: 'e0d49b62-5f1a-4c8e-a3d7-9b60f2e1c485' },
];

const HEX = '0123456789abcdef';

function randomHex(n: number): string {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += HEX[b & 15];
  return out;
}

/** A version 4 uuid, laid out the way google/uuid prints one. */
function uuidV4(): string {
  const h = randomHex(32).split('');
  h[12] = '4';
  h[16] = '89ab'[Number.parseInt(h[16], 16) & 3];
  const s = h.join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

/** WindowIndexTarget: all digits, at most four of them, and in range. */
function indexTarget(target: string, count: number): number {
  if (target === '' || target.length > 4 || !/^[0-9]+$/.test(target)) return -1;
  const idx = Number.parseInt(target, 10);
  return idx < count ? idx : -1;
}

function resolve(panes: Pane[], target: string, order: Order): Resolution {
  const steps: Step[] = [];
  const finish = (index: number, error = ''): Resolution => ({ index, error, steps });

  if (target === '') return finish(-1, 'empty window target');

  const exact = panes.findIndex((p) => p.id === target);
  steps.push({
    rule: 'exact id',
    outcome: exact >= 0 ? 'match' : 'none',
    detail: exact >= 0 ? panes[exact].name : 'no pane has this full id',
  });
  if (exact >= 0) return finish(exact);

  const idx = indexTarget(target, panes.length);
  steps.push({
    rule: 'index list-windows prints',
    outcome: idx >= 0 ? 'match' : 'none',
    detail: idx >= 0 ? `index ${idx} is ${panes[idx].name}` : 'not a number in range',
  });
  if (idx >= 0) return finish(idx);

  const byPrefix = (): Resolution | null => {
    const hits = panes.flatMap((p, i) => (p.id.startsWith(target) ? [i] : []));
    if (hits.length === 1) {
      steps.push({ rule: 'unique id prefix', outcome: 'match', detail: panes[hits[0]].name });
      return finish(hits[0]);
    }
    if (hits.length > 1) {
      steps.push({
        rule: 'unique id prefix',
        outcome: 'ambiguous',
        detail: hits.map((i) => panes[i].name).join(', '),
      });
      return finish(
        -1,
        `ambiguous window ID prefix "${target}" matches ${hits.length} windows. Use more of the id`,
      );
    }
    steps.push({ rule: 'unique id prefix', outcome: 'none', detail: 'no id starts with it' });
    return null;
  };

  const byName = (): Resolution | null => {
    const hits = panes.flatMap((p, i) => (p.name === target ? [i] : []));
    if (hits.length === 1) {
      steps.push({ rule: 'exact name', outcome: 'match', detail: panes[hits[0]].name });
      return finish(hits[0]);
    }
    if (hits.length > 1) {
      steps.push({ rule: 'exact name', outcome: 'ambiguous', detail: `${hits.length} panes` });
      return finish(-1, `ambiguous window name "${target}" matches ${hits.length} windows`);
    }
    steps.push({ rule: 'exact name', outcome: 'none', detail: 'no pane has this name' });
    return null;
  };

  const rules = order === 'before' ? [byPrefix, byName] : [byName, byPrefix];
  for (const rule of rules) {
    const r = rule();
    if (r) {
      // Mark the rule that never ran, so the reader sees it was never asked.
      const ran = new Set(steps.map((s) => s.rule));
      for (const name of ['exact name', 'unique id prefix']) {
        if (!ran.has(name)) steps.push({ rule: name, outcome: 'skipped', detail: 'not tried' });
      }
      return r;
    }
  }
  return finish(-1, `no window found matching "${target}"`);
}

/** The pane the caller meant: the one whose name is exactly the target. */
function meant(panes: Pane[], target: string): number {
  return panes.findIndex((p) => p.name === target);
}

interface Tally {
  runs: number;
  before: number;
  after: number;
  target: string;
}

function simulate(target: string, runs: number): Tally {
  let before = 0;
  let after = 0;
  for (let n = 0; n < runs; n++) {
    const panes = START.map((p) => ({ ...p, id: uuidV4() }));
    const want = meant(panes, target);
    if (resolve(panes, target, 'before').index !== want) before++;
    if (resolve(panes, target, 'after').index !== want) after++;
  }
  return { runs, before, after, target };
}

const OUTCOME: Record<Step['outcome'], string> = {
  none: 'no match',
  match: 'match',
  ambiguous: 'ambiguous',
  skipped: 'not tried',
};

export function WindowTargetOrder() {
  const inputId = useId();
  const [order, setOrder] = useState<Order>('before');
  const [panes, setPanes] = useState<Pane[]>(START);
  const [target, setTarget] = useState('db');
  const [tally, setTally] = useState<Tally | null>(null);

  const res = resolve(panes, target, order);
  const want = meant(panes, target);
  const wrong = want >= 0 && res.index !== want;
  const isHex = target !== '' && /^[0-9a-f]+$/.test(target);

  const reroll = () => setPanes((ps) => ps.map((p) => ({ ...p, id: uuidV4() })));

  // Give one pane other than the named one an id that starts with the target,
  // the draw that made the flake. Only hex digits can start a uuid.
  const collide = () => {
    if (!isHex || target.length > 8) return;
    setPanes((ps) => {
      const victim = ps.findIndex((p) => p.name !== target && p.name === 'web');
      const at = victim >= 0 ? victim : ps.findIndex((p) => p.name !== target);
      return ps.map((p, i) => {
        if (i !== at) return p;
        return { ...p, id: target + p.id.slice(target.length) };
      });
    });
  };

  const expected = (runs: number, t: string) => {
    if (!/^[0-9a-f]+$/.test(t) || meant(START, t) < 0) return 0;
    const others = START.length - 1;
    return runs * (1 - (1 - 16 ** -t.length) ** others);
  };

  let verdict: string;
  if (res.error) {
    verdict = `error: ${res.error}`;
  } else if (wrong) {
    verdict = `reaches ${panes[res.index].name} (${panes[res.index].id.slice(0, 8)}). The pane named ${target} is never touched, and the command still exits 0.`;
  } else {
    verdict = `reaches ${panes[res.index].name} (${panes[res.index].id.slice(0, 8)}).`;
  }

  const button =
    'rounded-md border px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary disabled:opacity-50';

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-col gap-3 p-4">
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Resolution order</legend>
          {(
            [
              ['before', 'id prefix first (before)'],
              ['after', 'name first (after)'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={order === value}
              onClick={() => setOrder(value)}
              className={cn(
                button,
                order === value
                  ? 'border-fd-primary bg-fd-primary/10 text-fd-foreground'
                  : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/60',
              )}
            >
              {label}
            </button>
          ))}
        </fieldset>

        <div className="flex flex-wrap items-end gap-2">
          <label htmlFor={inputId} className="flex min-w-0 flex-col gap-1.5">
            <span className="text-xs text-fd-muted-foreground">tuios set-agent-state working -w</span>
            <input
              id={inputId}
              type="text"
              value={target}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              maxLength={36}
              onChange={(e) => setTarget(e.target.value.trim())}
              className="w-40 min-w-0 rounded-md border border-fd-border bg-fd-background px-3 py-1.5 font-mono text-sm text-fd-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
            />
          </label>
          <button
            type="button"
            onClick={reroll}
            className={cn(button, 'border-fd-border text-fd-foreground hover:border-fd-primary/60')}
          >
            Draw new ids
          </button>
          <button
            type="button"
            onClick={collide}
            disabled={!isHex || target.length > 8}
            className={cn(button, 'border-fd-border text-fd-foreground hover:border-fd-primary/60')}
          >
            Start another id with it
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border-t border-fd-border">
        <table className="w-full min-w-[20rem] font-mono text-xs">
          <caption className="sr-only">The six panes and their window ids</caption>
          <thead>
            <tr className="text-left text-fd-muted-foreground">
              <th scope="col" className="px-4 py-2 font-normal">idx</th>
              <th scope="col" className="px-2 py-2 font-normal">id</th>
              <th scope="col" className="px-2 py-2 font-normal">name</th>
              <th scope="col" className="px-4 py-2 font-normal">
                <span className="sr-only">result</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {panes.map((p, i) => {
              const prefixLen = target && p.id.startsWith(target) ? target.length : 0;
              const hit = i === res.index;
              return (
                <tr
                  key={p.name}
                  className={cn(
                    'border-t border-fd-border/60',
                    hit && (wrong ? 'bg-fd-primary/10' : 'bg-fd-accent/60'),
                  )}
                >
                  <td className="px-4 py-1.5 text-fd-muted-foreground">{i}</td>
                  <td className="px-2 py-1.5 whitespace-nowrap">
                    <span className="font-semibold text-fd-primary underline decoration-dotted underline-offset-2">
                      {p.id.slice(0, Math.min(prefixLen, 8))}
                    </span>
                    <span className="text-fd-foreground">{p.id.slice(Math.min(prefixLen, 8), 8)}</span>
                    <span className="text-fd-muted-foreground">…</span>
                  </td>
                  <td
                    className={cn(
                      'px-2 py-1.5',
                      p.name === target ? 'font-semibold text-fd-foreground' : 'text-fd-muted-foreground',
                    )}
                  >
                    {p.name}
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap text-fd-foreground">
                    {hit ? (wrong ? '<- set (wrong pane)' : '<- set') : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 border-t border-fd-border px-4 py-3 font-mono text-xs">
        <ol className="flex flex-col gap-1">
          {res.steps.map((s, i) => (
            <li key={s.rule} className="flex flex-wrap gap-x-2">
              <span className="text-fd-muted-foreground">{i + 1}.</span>
              <span className="text-fd-foreground">{s.rule}</span>
              <span
                className={cn(
                  s.outcome === 'match' && 'text-fd-primary',
                  s.outcome === 'ambiguous' && 'text-fd-primary',
                  (s.outcome === 'none' || s.outcome === 'skipped') && 'text-fd-muted-foreground',
                )}
              >
                {OUTCOME[s.outcome]}
                {s.outcome !== 'skipped' && s.detail ? `: ${s.detail}` : ''}
              </span>
            </li>
          ))}
        </ol>
        <p
          aria-live="polite"
          className={cn('break-words', wrong || res.error ? 'text-fd-primary' : 'text-fd-foreground')}
        >
          -w {target || '""'} {verdict}
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t border-fd-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTally(simulate(target, 1000))}
            disabled={meant(START, target) < 0}
            className={cn(button, 'border-fd-border text-fd-foreground hover:border-fd-primary/60')}
          >
            Run the test 1,000 times
          </button>
          <span className="text-xs text-fd-muted-foreground">
            fresh ids each run, target <code>{target || '""'}</code>
          </span>
        </div>
        <p aria-live="polite" className="font-mono text-xs text-fd-foreground">
          {tally
            ? `-w ${tally.target} missed its pane in ${tally.before} of ${tally.runs} runs with the id prefix first (about ${Math.round(expected(tally.runs, tally.target))} expected), and in ${tally.after} with the name first.`
            : meant(START, target) < 0
              ? 'Type one of the six names to run it.'
              : 'Not run yet.'}
        </p>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        The daemon's window resolver, running in the page, over the six panes the
        flaky test opens. The ids start fixed on an unlucky draw: the pane named{' '}
        <code>web</code> has an id that starts with <code>db</code>. With the id
        prefix tried first, <code>-w db</code> reaches <code>web</code>. Switch the
        order, draw new ids, or type another name. Only a name made of hex digits
        can collide, so <code>web</code>, <code>api</code> and <code>ci</code>{' '}
        never do.
      </figcaption>
    </figure>
  );
}
