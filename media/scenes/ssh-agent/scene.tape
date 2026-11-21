# The pane's agent is the link, the link points at the client's agent,
# and ssh-add reaches it.
Run "echo $SSH_AUTH_SOCK"
Sleep 600ms
Run "tuios ssh-agent-path --json"
Sleep 800ms
Run "ssh-add -l"
Sleep 4500ms
Action screenshot_screen
Sleep 1500ms
