#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# Install the Claude Code hooks in the throwaway HOME, so tuios does not
# offer to install them over the shot.
mkdir -p ~/.claude && tuios integration install claude-code --no-skill >/dev/null
# The lead's read of its crew, as tuios --skill lead shows it: JSON through
# jq, not the box table.
cat > ~/crew <<'CREW'
#!/usr/bin/env bash
echo '$ tuios list-agents --json | jq -r ...'
tuios list-agents --json | jq -r '.agents[] | [.name, .state, .blocked_by // "", .message] | @tsv' |
  awk -F'\t' '{ s = $2; if ($3 != "") s = s " (" $3 ")"; printf "%-11s %-24s %s\n", $1, s, $4 }'
CREW
chmod +x ~/crew
