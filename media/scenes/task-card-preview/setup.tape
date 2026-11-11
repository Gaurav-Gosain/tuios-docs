# Two agents and a shell that adds the cards. Not part of the shot.
WaitFor panes 1 10s
RenameWindow "api"
Run "agent-demo working 'Add a jitter option to the retry backoff'"
Sleep 600ms
Action split_vertical
Sleep 400ms
RenameWindow "cache"
Run "agent-demo working 'Replace the map cache with the lru package'"
Sleep 400ms
Action split_horizontal
Sleep 400ms
RenameWindow "shell"
Run "~/cards.sh"
Sleep 4000ms
