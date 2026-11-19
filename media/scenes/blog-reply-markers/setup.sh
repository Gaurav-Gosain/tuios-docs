#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# The last reply of the claude-demo conversation.
cp "$MEDIA/scenes/blog-reply-markers/reply.md" reply.md
# Install the Claude Code hooks in the throwaway HOME, so tuios does not
# offer to install them over the shot.
mkdir -p ~/.claude && tuios integration install claude-code --no-skill >/dev/null
