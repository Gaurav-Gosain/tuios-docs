'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * The key-token language of `send-keys`, ported from keysToBytes and
 * keyTokenToBytes in tuios internal/session/daemon_native.go (the path a
 * headless session takes). Commas become spaces, the string is split on
 * whitespace, and each token is mapped to bytes on its own. The separators
 * are never sent.
 */
const NAMED: Record<string, string> = {
  enter: '\r',
  return: '\r',
  space: ' ',
  tab: '\t',
  escape: '\x1b',
  esc: '\x1b',
  backspace: '\x7f',
  delete: '\x1b[3~',
  del: '\x1b[3~',
  up: '\x1b[A',
  down: '\x1b[B',
  right: '\x1b[C',
  left: '\x1b[D',
  home: '\x1b[H',
  end: '\x1b[F',
  pageup: '\x1b[5~',
  pagedown: '\x1b[6~',
  insert: '\x1b[2~',
  f1: '\x1bOP',
  f2: '\x1bOQ',
  f3: '\x1bOR',
  f4: '\x1bOS',
  f5: '\x1b[15~',
  f6: '\x1b[17~',
  f7: '\x1b[18~',
  f8: '\x1b[19~',
  f9: '\x1b[20~',
  f10: '\x1b[21~',
  f11: '\x1b[23~',
  f12: '\x1b[24~',
};

function tokenToBytes(tok: string): string {
  const lower = tok.toLowerCase();
  if (tok === 'PREFIX' || tok === '$PREFIX') {
    throw new Error(
      'the prefix key only works with an attached client. Attach one and retry',
    );
  }
  if (lower in NAMED) return NAMED[lower];
  if (lower.startsWith('ctrl+')) {
    const after = lower.slice(5);
    if (after.length === 1) {
      const c = after.charCodeAt(0);
      if (c >= 97 && c <= 122) return String.fromCharCode(c & 0x1f);
      if (after === ' ' || after === '@') return '\x00';
      if (after === '[') return '\x1b';
      if (after === '\\') return '\x1c';
      if (after === ']') return '\x1d';
    }
    throw new Error(`unsupported ctrl combination "${tok}"`);
  }
  if (lower.startsWith('alt+')) {
    const after = lower.slice(4);
    if (after in NAMED) return `\x1b${NAMED[after]}`;
    if (after.length >= 1) return `\x1b${after}`;
    throw new Error(`unsupported alt combination "${tok}"`);
  }
  return tok;
}

function sendKeys(keys: string): { tokens: string[]; bytes: string } {
  const tokens = keys.replaceAll(',', ' ').split(/\s+/).filter(Boolean);
  if (tokens.length === 0) throw new Error(`no valid keys in sequence: ${keys}`);
  return { tokens, bytes: tokens.map(tokenToBytes).join('') };
}

/** Shows control bytes the way a Go %q would, so Enter is visibly \r. */
function quoteBytes(bytes: string): string {
  let out = '';
  for (const ch of bytes) {
    const c = ch.charCodeAt(0);
    if (ch === '\r') out += '\\r';
    else if (ch === '\n') out += '\\n';
    else if (ch === '\t') out += '\\t';
    else if (c === 0x1b) out += '\\x1b';
    else if (c < 0x20 || c === 0x7f) out += `\\x${c.toString(16).padStart(2, '0')}`;
    else out += ch;
  }
  return out;
}

/**
 * What a shell line editor makes of the bytes, reduced to the part that
 * matters here: each carriage return or newline submits the line typed so far.
 */
function submitted(bytes: string): string[] {
  const lines: string[] = [];
  let line = '';
  for (const ch of bytes) {
    if (ch === '\r' || ch === '\n') {
      lines.push(line);
      line = '';
    } else if (ch === '\x7f') {
      line = line.slice(0, -1);
    } else if (ch.charCodeAt(0) >= 0x20) {
      line += ch;
    }
  }
  return lines;
}

const PRESETS = ['echo hello,Enter', 'echo hello Enter', 'ls -la,Enter', 'ctrl+c'];

export function SendKeysTokens() {
  const inputId = useId();
  const [verb, setVerb] = useState<'send-keys' | 'send-text'>('send-keys');
  const [input, setInput] = useState('echo hello,Enter');
  const [newline, setNewline] = useState(true);

  let tokens: string[] = [];
  let bytes = '';
  let error = '';
  try {
    if (verb === 'send-keys') {
      const r = sendKeys(input);
      tokens = r.tokens;
      bytes = r.bytes;
    } else {
      bytes = input + (newline ? '\n' : '');
    }
  } catch (e) {
    error = (e as Error).message;
  }
  const runs = error ? [] : submitted(bytes);
  // Two text tokens in a row lose the separator between them.
  const literal = (t: string) => {
    try {
      return tokenToBytes(t) === t;
    } catch {
      return false;
    }
  };
  const glued =
    verb === 'send-keys' &&
    tokens.some((t, i) => i > 0 && literal(t) && literal(tokens[i - 1]));

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-col gap-3 p-4">
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Verb</legend>
          {(['send-keys', 'send-text'] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={verb === v}
              onClick={() => setVerb(v)}
              className={cn(
                'rounded-md border px-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-fd-primary',
                verb === v
                  ? 'border-fd-primary bg-fd-primary/10 text-fd-foreground'
                  : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/60',
              )}
            >
              {v}
            </button>
          ))}
        </fieldset>

        <label htmlFor={inputId} className="flex flex-col gap-1.5">
          <span className="text-xs text-fd-muted-foreground">
            {verb === 'send-keys' ? 'the keys argument' : 'the text argument'}
          </span>
          <input
            id={inputId}
            type="text"
            value={input}
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-3 py-2 font-mono text-sm text-fd-foreground focus:outline-none focus:ring-1 focus:ring-fd-primary"
          />
        </label>

        {verb === 'send-keys' ? (
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setInput(p)}
                className="rounded border border-fd-border px-2 py-1 font-mono text-xs text-fd-muted-foreground hover:border-fd-primary/60 hover:text-fd-foreground focus:outline-none focus:ring-1 focus:ring-fd-primary"
              >
                {p}
              </button>
            ))}
          </div>
        ) : (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newline}
              onChange={(e) => setNewline(e.target.checked)}
              className="size-4 accent-current"
            />
            <span className="text-fd-foreground">End with a newline</span>
          </label>
        )}
      </div>

      <div
        className="flex flex-col gap-2 border-t border-fd-border px-4 py-3 font-mono text-xs"
        aria-live="polite"
      >
        {verb === 'send-keys' && !error && (
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-fd-muted-foreground">tokens</span>
            {tokens.map((t, i) => (
              <span
                key={`${i}-${t}`}
                className="rounded bg-fd-muted/60 px-1.5 py-0.5 text-fd-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {error ? (
          <div className="text-fd-primary">error: {error}</div>
        ) : (
          <>
            <div className="break-all">
              <span className="text-fd-muted-foreground">written to the PTY </span>
              <span className="text-fd-foreground">"{quoteBytes(bytes)}"</span>
            </div>
            <div className="break-all">
              <span className="text-fd-muted-foreground">the shell runs </span>
              {runs.length === 0 ? (
                <span className="text-fd-muted-foreground">nothing yet</span>
              ) : (
                runs.map((r, i) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: lines repeat
                    key={i}
                    className={cn('mr-2', glued ? 'text-fd-primary' : 'text-fd-foreground')}
                  >
                    {r === '' ? '(empty line)' : r}
                  </span>
                ))
              )}
            </div>
            {glued && (
              <div className="text-fd-primary">
                two text tokens in a row: the separator between them was dropped
              </div>
            )}
          </>
        )}
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        The daemon's tokenizer for a headless session, running in the page. With{' '}
        <code>send-keys</code>, commas become spaces, the string splits on
        whitespace, and each token is sent as its own content. The separators
        never reach the pane, so <code>echo hello,Enter</code> runs{' '}
        <code>echohello</code>. Switch to <code>send-text</code> and the same
        words arrive as typed.
      </figcaption>
    </figure>
  );
}
