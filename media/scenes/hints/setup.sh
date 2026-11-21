#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# A health check log with an address, a URL and a build ID.
cat >~/health.log <<'LOG'
GET http://10.0.4.12:8080/health 200 3ms
{"status":"ok","build":"550e8400-e29b-41d4-a716-446655440000"}
pull request: https://github.com/example/notes/pull/42
LOG
