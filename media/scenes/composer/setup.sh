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

# The image the reply attaches, latency.png, is in fixtures/. latency.py
# draws it.
