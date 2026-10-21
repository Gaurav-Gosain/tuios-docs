#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# Install the Claude Code hooks in the throwaway HOME, so tuios does not
# offer to install them over the shot.
mkdir -p ~/.claude && tuios integration install claude-code --no-skill >/dev/null
# Stand-ins for the agents the sheet lists. They are on PATH as claude and
# codex, so the sheet finds them as installed agents. Each one only prints
# the task it was given.
mkdir -p bin
for a in claude codex; do
  printf '#!/usr/bin/env bash\nread -r task\necho "Task: $task"\nexec sleep 100000\n' >"bin/$a"
  chmod +x "bin/$a"
done
echo bin/ >>.git/info/exclude
# Commit the change project.sh leaves, so the base line has no note.
GIT_AUTHOR_DATE=2026-10-06T09:00:00 GIT_COMMITTER_DATE=2026-10-06T09:00:00 git commit -qam "Add Delete to the store"
