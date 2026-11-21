#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# A deploy summary: three bare URLs, and one OSC 8 link whose text is not
# its target.
cat >~/deploy.sh <<'DEPLOY'
#!/usr/bin/env bash
bold=$'\e[1m' grn=$'\e[32m' dim=$'\e[2m' off=$'\e[0m'
printf '%sDeployed%s notes-api to staging in 41s.\n\n' "$grn$bold" "$off"
printf '  Preview   https://notes-pr-42.example.dev/\n'
printf '  Logs      https://ci.example.dev/notes/runs/9317\n'
printf '  Issue     https://github.com/example/notes/issues/14\n'
printf '  Report    \e]8;;https://ci.example.dev/notes/runs/9317/report.html\e\\build report\e]8;;\e\\\n\n'
printf '%sCtrl+click a link to open it.%s\n' "$dim" "$off"
DEPLOY
chmod +x ~/deploy.sh
