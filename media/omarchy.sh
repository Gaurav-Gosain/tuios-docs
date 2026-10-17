#!/usr/bin/env bash
# omarchy.sh FILM.mp4
#
# The Omarchy page reuses the launch film instead of a new take: one take of
# the real Omarchy desktop at 60 fps, the whole screen in view, no zoom. This
# cuts the first 13.5 s (Tokyo Night, then Catppuccin Latte, Rose Pine and
# Gruvbox from Omarchy's own theme menu), scales it to 1280 wide and encodes
# it like every other clip. The film has no audio track.
#
# The film is not in this repository. It is the output of
# the launch rig (see the tuios-omarchy video project).
set -euo pipefail

film=$1
here=$(cd "$(dirname "$0")" && pwd)
public=$here/../public
run() { nice -n 19 taskset -c 0-3 "$@"; }

mkdir -p "$here/build/omarchy" "$public/clips"
run ffmpeg -v error -y -t 13.5 -i "$film" -an -vf "scale=1280:-2:flags=lanczos" \
  -c:v ffv1 -pix_fmt yuv444p "$here/build/omarchy/master.mkv"
bash "$here/encode.sh" "$here/build/omarchy/master.mkv" "$public/clips/omarchy"
# The poster is the first frame, on Tokyo Night, rather than the last.
run ffmpeg -v error -y -i "$here/build/omarchy/master.mkv" -frames:v 1 -c:v libwebp -quality 85 \
  "$public/clips/omarchy.webp"

