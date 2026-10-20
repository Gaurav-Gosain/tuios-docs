#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# report sends a status report and stays in the foreground, as a real
# program does: tuios drops a working or blocked report when the process
# group that sent it ends.
mkdir -p bin
cat >bin/report <<'SCRIPT'
#!/usr/bin/env bash
tuios status "$@"
exec sleep 600
SCRIPT
chmod +x bin/report
