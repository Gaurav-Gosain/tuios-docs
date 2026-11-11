/**
 * A reader's own [keybindings] laid over the defaults of the keybinding
 * explorer. The reader pastes a config.toml (or only its [keybindings]
 * tables); the explorer then shows their keys, the defaults they replace,
 * and the names tuios would not know.
 *
 * Plain data in and out, so it is tested without a page. The TOML is parsed
 * by the caller.
 */

export interface DefaultBinding {
  scope: string;
  section: string;
  action: string;
  keys: string[];
  mac?: string[];
}

export interface Overlay {
  /** "section action" to the keys the config gives, [] for unbound. */
  keys: Map<string, string[]>;
  /** The leader the config sets, when it is not the default. */
  leader?: string;
  /** The preset the config names. It moves defaults this view cannot show. */
  preset?: string;
  /** Section and action names that match nothing tuios has. */
  unknown: string[];
  /** How many actions the config changes. */
  changed: number;
}

/** A key of the explorer's map for one binding. */
export const rowKey = (section: string, action: string) =>
  `${section} ${action}`;

function isTable(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Keys as tuios reads a value: a list of strings, or one string. */
function keyList(v: unknown): string[] | null {
  if (typeof v === "string") return [v];
  if (Array.isArray(v) && v.every((k) => typeof k === "string")) return v;
  return null;
}

/**
 * Lay a parsed config over the defaults. `parsed` is the whole config.toml
 * or a document with only [keybindings] tables; both read the same.
 */
export function overlay(
  defaults: DefaultBinding[],
  parsed: Record<string, unknown>,
  defaultLeader: string,
): Overlay {
  const root = isTable(parsed.keybindings) ? parsed.keybindings : parsed;
  const known = new Map<string, Set<string>>();
  for (const b of defaults) {
    const set = known.get(b.section) ?? new Set<string>();
    set.add(b.action);
    known.set(b.section, set);
  }
  const out: Overlay = { keys: new Map(), unknown: [], changed: 0 };
  for (const [name, value] of Object.entries(root)) {
    if (name === "leader_key" && typeof value === "string") {
      if (value !== defaultLeader) out.leader = value;
      continue;
    }
    if (name === "preset" && typeof value === "string") {
      out.preset = value;
      continue;
    }
    if (!isTable(value)) continue;
    const actions = known.get(name);
    // Tables of their own shape, not action lists: menus, copy pipes and
    // the like. They are not bindings of the explorer's rows.
    if (!actions) {
      if (Object.values(value).some((v) => keyList(v) !== null)) {
        out.unknown.push(`[keybindings.${name}]`);
      }
      continue;
    }
    for (const [action, keys] of Object.entries(value)) {
      const list = keyList(keys);
      if (list === null) continue;
      if (!actions.has(action)) {
        out.unknown.push(`${name}.${action}`);
        continue;
      }
      out.keys.set(rowKey(name, action), list);
    }
  }
  out.changed = out.keys.size;
  return out;
}

/**
 * The keys one row shows: the config's when it names the action, else the
 * defaults. A prefix section takes only the key after the leader (and after
 * its sub-menu key), so the rest of the default chord is put in front. A
 * leader from the config replaces the default one in every prefix chord.
 */
export function shownKeys(
  b: DefaultBinding,
  defaults: string[],
  o: Overlay | null,
  defaultLeader: string,
): { keys: string[]; mine: boolean } {
  const swapLeader = (k: string) =>
    o?.leader && b.scope.startsWith("prefix") && k.startsWith(defaultLeader)
      ? o.leader + k.slice(defaultLeader.length)
      : k;
  const mine = o?.keys.get(rowKey(b.section, b.action));
  if (!mine) return { keys: defaults.map(swapLeader), mine: false };
  if (!b.scope.startsWith("prefix") || defaults.length === 0) {
    return { keys: mine, mine: true };
  }
  const head = defaults[0].split(" ").slice(0, -1).join(" ");
  return {
    keys: mine.map((k) => swapLeader(head ? `${head} ${k}` : k)),
    mine: true,
  };
}
