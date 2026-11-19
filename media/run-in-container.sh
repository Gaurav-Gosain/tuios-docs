#!/usr/bin/env bash
# run-in-container.sh: run scripts/docs-media.sh in the docs media container.
#
#   media/run-in-container.sh build               # build the image
#   media/run-in-container.sh [SCENE...]          # render the scenes
#
# The container sees only two folders of this machine:
#
#   /work       this docs checkout, read and write: the scenes, and the
#               shots and clips the render writes to public/
#   /opt/tuios  a copy of the tuios binary, read only (TUIOS_BIN, else the
#               tuios on PATH), in a temporary folder outside the home
#
# It sees no home folder, no ~/.ssh and no ~/.config of this machine, and no
# environment variable of this shell.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
image=${DOCS_MEDIA_IMAGE:-localhost/tuios-docs-media:1}

if [[ ${1:-} == build ]]; then
  exec podman build --format docker -t "$image" -f "$root/media/Containerfile" "$root/media"
fi

# The checkout must not be a home folder or hold one: the container gets it
# read and write.
for home in "$HOME" "$(getent passwd "$(id -u)" | cut -d: -f6)"; do
  case $home/ in
  "$root"/*) echo "run-in-container: $root holds the home folder $home. Use a docs checkout of its own." >&2; exit 1 ;;
  esac
done

tuios=${TUIOS_BIN:-$(command -v tuios || true)}
[[ -x $tuios ]] || { echo "run-in-container: set TUIOS_BIN or put tuios on PATH" >&2; exit 1; }
stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT
cp "$tuios" "$stage/tuios"

scenes=("$@")
if ((${#scenes[@]} == 0)); then
  for d in "$root"/media/scenes/*/; do scenes+=("$(basename "$d")"); done
fi

# One container per scene, so each take gets the host name its scene names
# (rootless podman cannot change it inside). keep-id: the container user is
# this user, so files in /work stay theirs. The takes start their own tuios
# daemons and sshd in the container, and they end with it.
for scene in "${scenes[@]}"; do
  json=$root/media/scenes/$scene/scene.json
  [[ -f $json ]] || { echo "run-in-container: no scene $scene" >&2; exit 1; }
  host=$(jq -r '.hostname // "demo"' "$json")
  podman run --rm --init --userns=keep-id --hostname "$host" \
    -v "$root:/work" \
    -v "$stage:/opt/tuios:ro" \
    -e TUIOS_BIN=/opt/tuios/tuios \
    "$image" bash scripts/docs-media.sh "$scene"
done
