#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"

# The test run the reply pastes: long enough to show as one paste block.
{
  echo '=== RUN   TestRetryJitter'
  for i in $(seq 1 18); do
    printf '    retry_test.go:%d: attempt %d waited %dms\n' $((40 + i)) "$i" $((100 * i + (i * 37) % 90))
  done
  echo '    retry_test.go:61: wait 1873ms is over the 1800ms cap'
  echo '--- FAIL: TestRetryJitter (2.31s)'
  echo 'FAIL'
  echo 'FAIL	example.com/notes/internal/store	2.318s'
} >test.log

# The image the reply attaches: a latency graph with a spike, bright enough
# to read in a preview three rows high.
magick -size 1280x720 xc:'#eff1f5' \
  -stroke none -fill '#8caaee' \
  -draw 'polygon 0,720 0,520 160,500 320,510 440,470 560,490 640,430 720,140 800,110 880,420 1040,450 1160,440 1280,450 1280,720' \
  -fill '#e64553' -draw 'circle 800,110 840,110' \
  latency.png
