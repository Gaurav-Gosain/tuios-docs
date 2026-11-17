#!/usr/bin/env bash
# Writes the three data files behind the reference widgets from a tuios
# checkout, so they match the tuios commit the site pins:
#
#   lib/commands/commands.json     the command finder (/docs/commands)
#   lib/options/options.json       the option explorer (/docs/config-options)
#   lib/keybindings/defaults.json  the keybinding explorer (/docs/keybindings)
#
#   scripts/reference-data.sh <tuios checkout>
#
# deploy.yml runs it on the commit in reference/TUIOS_REF. check.yml runs it
# with --check, which fails when the committed files differ from what that
# commit gives. To move the site to a newer tuios, change reference/TUIOS_REF
# and run the script.
#
# Each report runs in a throwaway home with a daemon of its own, so no user
# config leaks in and no running tuios is touched. The macOS keys come from
# the same binary: tuios reads GOOS=darwin from the environment and builds the
# macOS defaults.
set -euo pipefail

check=0
if [[ ${1:-} == --check ]]; then
  check=1
  shift
fi
src=${1:?usage: scripts/reference-data.sh [--check] <tuios checkout>}
src=$(cd "$src" && pwd)
site=$(cd "$(dirname "$0")/.." && pwd)
ref=$(git -C "$src" rev-parse HEAD)

work=$(mktemp -d)
trap 'kill "$daemon" 2>/dev/null || true; rm -rf "$work"' EXIT
daemon=

echo "building tuios at $ref"
(cd "$src" && go build -o "$work/tuios" ./cmd/tuios)

home=$work/home
mkdir -p "$home/run"
chmod 700 "$home/run"
# Only what tuios needs: no TUIOS_ variable of the shell that runs this.
run() {
  env -i PATH="$PATH" HOME="$home" TERM=xterm-256color \
    XDG_CONFIG_HOME="$home/config" XDG_STATE_HOME="$home/state" \
    XDG_DATA_HOME="$home/data" XDG_RUNTIME_DIR="$home/run" "$@"
}

run "$work/tuios" help --json >"$work/help.json"
run "$work/tuios" keybinds doctor --json >"$work/linux.json"
run GOOS=darwin "$work/tuios" keybinds doctor --json >"$work/darwin.json"

# list-options reads a running daemon.
run "$work/tuios" daemon >"$work/daemon.log" 2>&1 &
daemon=$!
for _ in $(seq 100); do
  if run "$work/tuios" list-options --json >"$work/options.json" 2>/dev/null; then
    break
  fi
  sleep 0.1
done
run "$work/tuios" kill-server >/dev/null 2>&1 || true
wait "$daemon" 2>/dev/null || true
daemon=

targets=(lib/commands/commands.json lib/options/options.json lib/keybindings/defaults.json)
if ((check)); then
  for t in "${targets[@]}"; do cp "$site/$t" "$work/$(basename "$t").before"; done
fi

bun "$site/scripts/commands.mjs" "$work/help.json" "$ref"
bun "$site/scripts/options.mjs" "$work/options.json" "$ref"
bun "$site/scripts/keybindings.mjs" "$work/darwin.json" "$work/linux.json" "$ref"

if ((check)); then
  stale=0
  for t in "${targets[@]}"; do
    if ! cmp -s "$site/$t" "$work/$(basename "$t").before"; then
      echo "$t does not match tuios $ref. Run: scripts/reference-data.sh <tuios checkout at reference/TUIOS_REF>" >&2
      stale=1
    fi
  done
  exit "$stale"
fi
