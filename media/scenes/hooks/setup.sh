#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
: >~/hooks.log
# An agent turn: working, then done. after-agent-state logs the done.
cat >~/agent.sh <<'AGENT'
#!/usr/bin/env bash
bold=$'\e[1m' grn=$'\e[32m' acc=$'\e[38;5;141m' dim=$'\e[2m' off=$'\e[0m'
clear
printf '%s* agent%s  %s\n\n' "$acc$bold" "$off" "$dim~/project$off"
printf '%s>%s Add a jitter option to the retry backoff\n\n' "$bold" "$off"
tuios set-agent-state working -m 'Add a jitter option to the retry backoff' >/dev/null
printf '  %sRead%s internal/store/store.go\n' "$grn" "$off"
sleep 3
printf '  %sEdit%s internal/store/retry.go %s+12%s\n\n' "$grn" "$off" "$grn" "$off"
printf '  %sDone.%s The backoff adds up to 20%% jitter.\n' "$grn" "$off"
tuios set-agent-state done -m 'Added jitter to the retry backoff' >/dev/null
exec sleep 100000
AGENT
chmod +x ~/agent.sh
