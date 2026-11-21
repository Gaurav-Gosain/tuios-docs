#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# Two agents that report as Claude Code, so herdr sees an agent in each.
cat >~/agent.sh <<'AGENT'
#!/usr/bin/env bash
# agent.sh STATE MESSAGE [KIND]
state=$1 msg=$2 kind=${3:-}
bold=$'\e[1m' grn=$'\e[32m' acc=$'\e[38;5;141m' yel=$'\e[33m' dim=$'\e[2m' off=$'\e[0m'
clear
printf '%s* agent%s  %s\n\n' "$acc$bold" "$off" "$dim~/project$off"
printf '%s>%s %s\n\n' "$bold" "$off" "$msg"
printf '  %sRead%s internal/store/store.go\n' "$grn" "$off"
if [[ $state == needs_input ]]; then
  printf '\n  %sAllow this command?%s\n    go test ./internal/store/...\n' "$yel$bold" "$off"
else
  printf '  %s* Writing the tests...%s\n' "$acc" "$off"
fi
args=("$state" -m "$msg" --harness claude-code)
[[ -n $kind ]] && args+=(--kind "$kind")
tuios set-agent-state "${args[@]}" >/dev/null 2>&1
exec sleep 100000
AGENT
chmod +x ~/agent.sh
