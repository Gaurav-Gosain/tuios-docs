#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# The client's ssh agent, with one key. The rig starts tuios with
# SSH_AUTH_SOCK set to it (scene.json "env").
mkdir -p ~/.ssh && chmod 700 ~/.ssh
ssh-keygen -q -t ed25519 -N '' -C 'demo@laptop' -f ~/.ssh/id_ed25519
eval "$(ssh-agent -a "$HOME/.ssh/agent.sock")" >/dev/null
ssh-add -q ~/.ssh/id_ed25519
