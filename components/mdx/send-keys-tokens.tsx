"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * The key-token language of `send-keys`, ported from parseSendKeys,
 * parseKeyToken and sendKey.bytes in tuios internal/session/sendkeys.go, the
 * parser both routes share. Commas become spaces, the string is split on
 * whitespace, and each token is parsed on its own: a key name (in any of the
 * spellings the alias table knows), a modifier chord, an escape sequence, a
 * single character, or any other word, which is typed as its characters. The
 * separators are never sent. Bytes are shown for a pane that has not turned on
 * application cursor keys.
 */
interface NamedKey {
  name: string;
  kind: "plain" | "cursor" | "tilde" | "ss3";
  plain?: string;
  final?: string;
  num?: number;
}

const NAMED_KEYS: NamedKey[] = [
  { name: "Enter", kind: "plain", plain: "\r" },
  { name: "Tab", kind: "plain", plain: "\t" },
  { name: "BTab", kind: "plain", plain: "\x1b[Z" },
  { name: "Space", kind: "plain", plain: " " },
  { name: "Escape", kind: "plain", plain: "\x1b" },
  { name: "Backspace", kind: "plain", plain: "\x7f" },
  { name: "Up", kind: "cursor", final: "A" },
  { name: "Down", kind: "cursor", final: "B" },
  { name: "Right", kind: "cursor", final: "C" },
  { name: "Left", kind: "cursor", final: "D" },
  { name: "Home", kind: "cursor", final: "H" },
  { name: "End", kind: "cursor", final: "F" },
  { name: "PageUp", kind: "tilde", num: 5 },
  { name: "PageDown", kind: "tilde", num: 6 },
  { name: "Insert", kind: "tilde", num: 2 },
  { name: "Delete", kind: "tilde", num: 3 },
  { name: "F1", kind: "ss3", final: "P" },
  { name: "F2", kind: "ss3", final: "Q" },
  { name: "F3", kind: "ss3", final: "R" },
  { name: "F4", kind: "ss3", final: "S" },
  { name: "F5", kind: "tilde", num: 15 },
  { name: "F6", kind: "tilde", num: 17 },
  { name: "F7", kind: "tilde", num: 18 },
  { name: "F8", kind: "tilde", num: 19 },
  { name: "F9", kind: "tilde", num: 20 },
  { name: "F10", kind: "tilde", num: 21 },
  { name: "F11", kind: "tilde", num: 23 },
  { name: "F12", kind: "tilde", num: 24 },
];

const KEY_BY_NAME = new Map(NAMED_KEYS.map((k) => [k.name, k]));

const ALIASES: Record<string, string> = {
  return: "Enter",
  ret: "Enter",
  cr: "Enter",
  kpenter: "Enter",
  backtab: "BTab",
  stab: "BTab",
  spc: "Space",
  esc: "Escape",
  bspace: "Backspace",
  bs: "Backspace",
  bksp: "Backspace",
  del: "Delete",
  dc: "Delete",
  ins: "Insert",
  ic: "Insert",
  pgup: "PageUp",
  ppage: "PageUp",
  prior: "PageUp",
  prevpage: "PageUp",
  pgdn: "PageDown",
  pgdown: "PageDown",
  npage: "PageDown",
  next: "PageDown",
  nextpage: "PageDown",
  pagedn: "PageDown",
  ...Object.fromEntries(NAMED_KEYS.map((k) => [k.name.toLowerCase(), k.name])),
};

interface Mods {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  superKey: boolean;
}

const NO_MODS: Mods = {
  ctrl: false,
  alt: false,
  shift: false,
  superKey: false,
};

function xtermMod(m: Mods): number {
  return 1 + (m.shift ? 1 : 0) + (m.alt ? 2 : 0) + (m.ctrl ? 4 : 0);
}

function normalizeKeyName(tok: string): { norm: string; keyish: boolean } {
  let s = tok.toLowerCase();
  let keyish = false;
  if (s.length > 2 && s.startsWith("<") && s.endsWith(">")) {
    s = s.slice(1, -1);
    keyish = true;
  }
  s = s.replace(/[-_ ]/g, "");
  if (s.length > 3 && s.startsWith("key")) {
    s = s.slice(3);
    keyish = true;
  }
  if (s.length > 5 && s.startsWith("arrow")) {
    s = s.slice(5);
    keyish = true;
  } else if (s.length > 5 && s.endsWith("arrow")) {
    s = s.slice(0, -5);
    keyish = true;
  }
  return { norm: s, keyish };
}

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return row[b.length];
}

function isTransposition(a: string, b: string): boolean {
  if (a.length !== b.length || a === b) return false;
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return (
    i + 1 < a.length &&
    a[i] === b[i + 1] &&
    a[i + 1] === b[i] &&
    a.slice(i + 2) === b.slice(i + 2)
  );
}

/** closestMatch in verb_hints.go, then a swap of two letters, as suggestKeyName does. */
function suggestKeyName(norm: string): string {
  if (!norm) return "";
  const names = Object.keys(ALIASES);
  if (names.includes(norm)) return "";
  const limit = Math.min(Math.floor(norm.length / 4) + 1, 3);
  let best = "";
  let bestDist = limit + 1;
  for (const c of names) {
    if (Math.abs(norm.length - c.length) > limit) continue;
    const d = editDistance(norm, c);
    if (d < bestDist || (d === bestDist && c < best)) {
      bestDist = d;
      best = c;
    }
  }
  if (!best) best = names.find((alias) => isTransposition(norm, alias)) ?? "";
  return best ? ALIASES[best] : "";
}

function looksLikeKeyName(tok: string, norm: string): boolean {
  if (norm.length >= 2 && norm[0] === "f" && /^\d+$/.test(norm.slice(1)))
    return true;
  const first = tok[0] ?? "";
  if (
    first === first.toLowerCase() ||
    first !== first.toUpperCase() ||
    norm.length < 3
  )
    return false;
  return suggestKeyName(norm) !== "";
}

function unknownKey(tok: string, didYouMean = ""): Error {
  return new Error(
    `unknown key "${tok}"${didYouMean ? ` (did you mean ${didYouMean}?)` : ""}. Nothing was sent`,
  );
}

function controlByte(ch: string): string | null {
  const c = ch.charCodeAt(0);
  if ((c >= 97 && c <= 122) || (c >= 65 && c <= 90))
    return String.fromCharCode(c & 0x1f);
  if (ch === "@" || ch === " " || ch === "2") return "\x00";
  if (ch === "[") return "\x1b";
  if (ch === "\\") return "\x1c";
  if (ch === "]") return "\x1d";
  if (ch === "^" || ch === "6") return "\x1e";
  if (ch === "_" || ch === "-") return "\x1f";
  if (ch === "?") return "\x7f";
  return null;
}

function namedBytes(k: NamedKey, m: Mods): string {
  const mod = xtermMod(m);
  switch (k.kind) {
    case "cursor":
      return mod > 1 ? `\x1b[1;${mod}${k.final}` : `\x1b[${k.final}`;
    case "ss3":
      return mod > 1 ? `\x1b[1;${mod}${k.final}` : `\x1bO${k.final}`;
    case "tilde":
      return mod > 1 ? `\x1b[${k.num};${mod}~` : `\x1b[${k.num}~`;
  }
  let out = k.plain ?? "";
  if (k.name === "Tab" && m.shift) out = "\x1b[Z";
  else if (k.name === "Space" && m.ctrl) out = "\x00";
  else if (k.name === "Backspace" && m.ctrl) out = "\x08";
  return m.alt ? `\x1b${out}` : out;
}

function withMods(tok: string, m: Mods, key: string): string {
  if (m.superKey) {
    throw new Error(
      `unsupported modifier in "${tok}": a terminal has no encoding for super. Use ctrl, alt or shift`,
    );
  }
  if (Array.from(key).length === 1) {
    let out = m.shift ? key.toUpperCase() : key;
    if (m.ctrl) {
      const b = controlByte(key);
      if (b === null) {
        throw new Error(
          `unsupported ctrl combination "${tok}": ctrl works on a letter or one of @ [ \\ ] ^ _ ? and space`,
        );
      }
      out = b;
    }
    return m.alt ? `\x1b${out}` : out;
  }
  const name = ALIASES[normalizeKeyName(key).norm];
  if (!name) throw unknownKey(tok, suggestKeyName(normalizeKeyName(key).norm));
  if (name === "BTab")
    return namedBytes(KEY_BY_NAME.get("Tab") as NamedKey, {
      ...m,
      shift: true,
    });
  return namedBytes(KEY_BY_NAME.get(name) as NamedKey, m);
}

/** splitKeyMods: tmux's C-, M-, S- in front, or ctrl+alt+x. null when there is no modifier. */
function splitKeyMods(tok: string): { mods: Mods; rest: string } | null {
  let rest = tok;
  const mods = { ...NO_MODS };
  let has = false;
  while (rest.length > 2 && rest[1] === "-") {
    if (rest[0] === "C") mods.ctrl = true;
    else if (rest[0] === "M") mods.alt = true;
    else if (rest[0] === "S") mods.shift = true;
    else return null;
    rest = rest.slice(2);
    has = true;
  }
  if (has) return { mods, rest };
  if (!tok.includes("+") || tok.length < 2) return null;
  let parts = tok.split("+");
  if (tok.endsWith("++")) parts = [...parts.slice(0, -2), "+"];
  let key = "";
  for (const p of parts) {
    switch (p.trim().toLowerCase()) {
      case "ctrl":
      case "control":
      case "ctl":
        mods.ctrl = true;
        break;
      case "alt":
      case "opt":
      case "option":
      case "meta":
        mods.alt = true;
        break;
      case "shift":
        mods.shift = true;
        break;
      case "super":
      case "cmd":
      case "win":
        mods.superKey = true;
        break;
      default:
        if (key !== "") throw unknownKey(tok);
        key = p;
    }
  }
  if (key === "") {
    throw new Error(
      `unsupported ctrl combination "${tok}": a modifier needs a key after it, as in ctrl+c`,
    );
  }
  return { mods, rest: key };
}

/** decodeEscapeToken, for the common spellings: \e, \x1b, \033 and ^[. */
function decodeEscape(tok: string): string | null {
  let body: string;
  if (tok.startsWith("\x1b")) return tok;
  if (tok.startsWith("^[")) body = `\\e${tok.slice(2)}`;
  else if (/^(\\e|\\E|\\x1b|\\x1B|\\033|\\u001b|\\u001B)/.test(tok)) body = tok;
  else return null;
  return body
    .replace(/\\(e|E)/g, "\x1b")
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, h) =>
      String.fromCharCode(Number.parseInt(h, 16)),
    )
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) =>
      String.fromCharCode(Number.parseInt(h, 16)),
    )
    .replace(/\\([0-3][0-7]{0,2})/g, (_, o) =>
      String.fromCharCode(Number.parseInt(o, 8)),
    )
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t");
}

/** The bytes one token writes, and whether it was typed as plain text. */
function tokenToBytes(tok: string): { bytes: string; text: boolean } {
  if (/^\$?prefix$/i.test(tok)) {
    throw new Error(
      "the prefix key only works with an attached client. Attach one and retry",
    );
  }
  const esc = decodeEscape(tok);
  if (esc !== null) return { bytes: esc, text: false };
  if (Array.from(tok).length === 1) return { bytes: tok, text: true };
  if (tok.length === 2 && tok[0] === "^")
    return {
      bytes: withMods(tok, { ...NO_MODS, ctrl: true }, tok[1]),
      text: false,
    };
  const split = splitKeyMods(tok);
  if (split)
    return { bytes: withMods(tok, split.mods, split.rest), text: false };
  const { norm, keyish } = normalizeKeyName(tok);
  const name = ALIASES[norm];
  if (name)
    return {
      bytes: namedBytes(KEY_BY_NAME.get(name) as NamedKey, NO_MODS),
      text: false,
    };
  if (keyish || looksLikeKeyName(tok, norm))
    throw unknownKey(tok, suggestKeyName(norm));
  // Any other word is typed as its characters.
  return { bytes: tok, text: true };
}

function sendKeys(keys: string): {
  tokens: string[];
  bytes: string;
  text: boolean[];
} {
  const tokens = keys.replaceAll(",", " ").split(/\s+/).filter(Boolean);
  if (tokens.length === 0)
    throw new Error(`no valid keys in sequence: ${keys}`);
  const parsed = tokens.map(tokenToBytes);
  return {
    tokens,
    bytes: parsed.map((p) => p.bytes).join(""),
    text: parsed.map((p) => p.text),
  };
}

/** Shows control bytes the way a Go %q would, so Enter is visibly \r. */
function quoteBytes(bytes: string): string {
  let out = "";
  for (const ch of bytes) {
    const c = ch.charCodeAt(0);
    if (ch === "\r") out += "\\r";
    else if (ch === "\n") out += "\\n";
    else if (ch === "\t") out += "\\t";
    else if (c === 0x1b) out += "\\x1b";
    else if (c < 0x20 || c === 0x7f)
      out += `\\x${c.toString(16).padStart(2, "0")}`;
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
  let line = "";
  for (const ch of bytes) {
    if (ch === "\r" || ch === "\n") {
      lines.push(line);
      line = "";
    } else if (ch === "\x7f") {
      line = line.slice(0, -1);
    } else if (ch.charCodeAt(0) >= 0x20) {
      line += ch;
    }
  }
  return lines;
}

const PRESETS = [
  "echo hello,Enter",
  "echo hello Enter",
  "ls -la,Enter",
  "ctrl+c",
  "Dwon,Enter",
];

export function SendKeysTokens() {
  const inputId = useId();
  const [verb, setVerb] = useState<"send-keys" | "send-text">("send-keys");
  const [input, setInput] = useState("echo hello,Enter");
  const [newline, setNewline] = useState(true);

  let tokens: string[] = [];
  let textTokens: boolean[] = [];
  let bytes = "";
  let error = "";
  try {
    if (verb === "send-keys") {
      const r = sendKeys(input);
      tokens = r.tokens;
      textTokens = r.text;
      bytes = r.bytes;
    } else {
      bytes = input + (newline ? "\n" : "");
    }
  } catch (e) {
    error = (e as Error).message;
  }
  const runs = error ? [] : submitted(bytes);
  // Two text tokens in a row lose the separator between them.
  const glued =
    verb === "send-keys" &&
    textTokens.some((t, i) => i > 0 && t && textTokens[i - 1]);

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-col gap-3 p-4">
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Verb</legend>
          {(["send-keys", "send-text"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={verb === v}
              onClick={() => setVerb(v)}
              className={cn(
                "rounded-md border px-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-fd-primary",
                verb === v
                  ? "border-fd-primary bg-fd-primary/10 text-fd-foreground"
                  : "border-fd-border text-fd-muted-foreground hover:border-fd-primary/60",
              )}
            >
              {v}
            </button>
          ))}
        </fieldset>

        <label htmlFor={inputId} className="flex flex-col gap-1.5">
          <span className="text-xs text-fd-muted-foreground">
            {verb === "send-keys" ? "the keys argument" : "the text argument"}
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

        {verb === "send-keys" ? (
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
        {verb === "send-keys" && !error && (
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
              <span className="text-fd-muted-foreground">
                written to the PTY{" "}
              </span>
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
                    className={cn(
                      "mr-2",
                      glued ? "text-fd-primary" : "text-fd-foreground",
                    )}
                  >
                    {r === "" ? "(empty line)" : r}
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
        The daemon's key parser, running in the page. With{" "}
        <code>send-keys</code>, commas become spaces, the string splits on
        whitespace, and each token is sent as its own content. The separators
        never reach the pane, so <code>echo hello,Enter</code> runs{" "}
        <code>echohello</code>. Switch to <code>send-text</code> and the same
        words arrive as typed.
      </figcaption>
    </figure>
  );
}
