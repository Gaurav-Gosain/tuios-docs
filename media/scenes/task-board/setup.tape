# Three agents, then the cards in the shell pane. Not part of the shot.
WaitFor panes 1 10s
RenameWindow "api-1"
Run "agent-demo working 'Add a jitter option to the retry backoff'"
Sleep 600ms
Action split_vertical
Sleep 400ms
RenameWindow "api-2"
Run "agent-demo needs_input 'Replace the map cache with the lru package' approval"
Sleep 400ms
Action split_horizontal
Sleep 400ms
RenameWindow "docs-1"
Run "agent-demo done 'Draft the rollout notes'"
Sleep 400ms
Focus "api-1"
Sleep 300ms
Action split_horizontal
Sleep 400ms
RenameWindow "shell"
Run "~/cards.sh"
Sleep 4500ms
