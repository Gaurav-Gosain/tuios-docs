#!/usr/bin/env bash
# encode.sh MASTER.mkv OUT_BASE
#
# Compresses a lossless master from render.mjs into what a docs page loads:
#
#   OUT_BASE.webm   AV1 (SVT-AV1), the first source
#   OUT_BASE.mp4    H.264 High, for browsers without AV1
#   OUT_BASE.webp   the poster: the last frame, the state the clip ends in
#
# Every encode runs at nice 19 on cores 0 to 3, one at a time, because other
# heavy jobs share this machine. The clip has no audio track.
#
# A clip over BUDGET bytes (default 1.5 MB) is encoded again at a higher CRF,
# up to three times, and the script fails if it still does not fit.
set -euo pipefail

master=$1 out=$2
BUDGET=${BUDGET:-1500000}
run() { SVT_LOG=1 nice -n 19 taskset -c 0-3 "$@"; }

encode_av1() { # CRF
  run ffmpeg -v error -y -i "$master" -an -c:v libsvtav1 -preset 6 -crf "$1" \
    -svtav1-params tune=0:keyint=10s -pix_fmt yuv420p -g 600 "$out.webm"
}
encode_h264() { # CRF
  run ffmpeg -v error -y -i "$master" -an -c:v libx264 -preset slow -crf "$1" \
    -tune animation -profile:v high -pix_fmt yuv420p -movflags +faststart "$out.mp4"
}

fit() { # NAME ENCODER CRF...
  local name=$1 enc=$2 file=$3
  shift 3
  for crf in "$@"; do
    "$enc" "$crf"
    local size
    size=$(stat -c %s "$file")
    if ((size <= BUDGET)); then
      printf '%s: %s bytes at crf %s\n' "$name" "$size" "$crf"
      return 0
    fi
  done
  printf '%s: %s bytes is over the %s byte budget\n' "$name" "$size" "$BUDGET" >&2
  return 1
}

fit webm encode_av1 "$out.webm" 28 34 40
fit mp4 encode_h264 "$out.mp4" 20 24 28

# The poster is the last frame: the clip ends on the state the page is about.
run ffmpeg -v error -y -sseof -0.1 -i "$master" -frames:v 1 -c:v libwebp -quality 85 "$out.webp"

# Every encoded frame must be 1/60 s after the one before it.
for f in "$out.webm" "$out.mp4"; do
  ffprobe -v error -select_streams v:0 -show_entries packet=pts_time -of csv=p=0 "$f" |
    sort -n | awk -v f="$f" '
      NR > 1 { d = $1 - p; if (d > max) max = d; if (d < min || NR == 2) min = d }
      { p = $1 }
      END { printf "%s: %d frames, frame gap %.1f to %.1f ms\n", f, NR, min * 1000, max * 1000
            if (max > 0.0175) { print f ": a frame gap is over 1/60 s" > "/dev/stderr"; exit 1 } }'
done
