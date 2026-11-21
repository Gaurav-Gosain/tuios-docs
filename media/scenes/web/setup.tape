# The session web that tuios-web made for the browser: an agent and a
# shell. Not part of the shots.
WaitFor panes 1 15s
RenameWindow "api"
Run "agent-demo working 'Add a jitter option to the retry backoff'"
Sleep 600ms
Action split_vertical
Sleep 600ms
RenameWindow "shell"
Run "clear; git --no-pager log --oneline"
Sleep 4500ms
