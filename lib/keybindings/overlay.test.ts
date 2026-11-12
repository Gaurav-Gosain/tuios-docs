import { describe, expect, test } from "bun:test";
import { parse } from "smol-toml";
import data from "./defaults.json";
import { type DefaultBinding, overlay, rowKey, shownKeys } from "./overlay";

const defaults = data.bindings as DefaultBinding[];
const find = (section: string, action: string) => {
  const b = defaults.find((x) => x.section === section && x.action === action);
  if (!b) throw new Error(`no ${section}.${action} in the data`);
  return b;
};

describe("overlay", () => {
  test("reads a whole config.toml and only its keybindings", () => {
    const toml = `
[appearance]
theme = "nord"

[keybindings]
leader_key = "ctrl+a"

[keybindings.copy_mode]
copy_mode_word_forward = ["alt+right"]
copy_mode_word_backward = []

[keybindings.prefix_mode]
prefix_file_search = ["f"]

[keybindings.nonsense]
foo = ["x"]

[keybindings.copy_mode_typo]
bar = ["y"]
`;
    const o = overlay(defaults, parse(toml), data.leader);
    expect(o.leader).toBe("ctrl+a");
    expect(o.keys.get(rowKey("copy_mode", "copy_mode_word_forward"))).toEqual([
      "alt+right",
    ]);
    expect(o.keys.get(rowKey("copy_mode", "copy_mode_word_backward"))).toEqual(
      [],
    );
    expect(o.unknown).toEqual([
      "[keybindings.nonsense]",
      "[keybindings.copy_mode_typo]",
    ]);
    expect(o.changed).toBe(3);
  });

  test("an action tuios does not have is named", () => {
    const o = overlay(
      defaults,
      parse(`[keybindings.copy_mode]\ncopy_mode_wrod_forward = ["w"]`),
      data.leader,
    );
    expect(o.unknown).toEqual(["copy_mode.copy_mode_wrod_forward"]);
    expect(o.changed).toBe(0);
  });

  test("menus and copy pipes are not rows", () => {
    const o = overlay(
      defaults,
      parse(`
[keybindings.menus.git]
key = "g"
[[keybindings.copy_pipe]]
key = "y"
command = "pbcopy"
`),
      data.leader,
    );
    expect(o.unknown).toEqual([]);
    expect(o.changed).toBe(0);
  });
});

describe("shownKeys", () => {
  test("a prefix key keeps the chord in front, with the new leader", () => {
    const o = overlay(
      defaults,
      parse(`
[keybindings]
leader_key = "ctrl+a"
[keybindings.prefix_mode]
choose_buffer = ["="]
`),
      data.leader,
    );
    const b = find("prefix_mode", "choose_buffer");
    expect(shownKeys(b, b.keys, o, data.leader)).toEqual({
      keys: ["ctrl+a ="],
      mine: true,
    });
  });

  test("an untouched prefix chord takes the new leader", () => {
    const o = overlay(
      defaults,
      parse(`[keybindings]\nleader_key = "ctrl+a"`),
      data.leader,
    );
    const b = find("window_prefix", "prefix_cancel");
    const shown = shownKeys(b, b.keys, o, data.leader);
    expect(shown.mine).toBe(false);
    expect(shown.keys[0].startsWith("ctrl+a t ")).toBe(true);
  });

  test("without a config, the defaults", () => {
    const b = find("copy_mode", "copy_mode_word_forward");
    expect(shownKeys(b, b.keys, null, data.leader)).toEqual({
      keys: b.keys,
      mine: false,
    });
  });
});
