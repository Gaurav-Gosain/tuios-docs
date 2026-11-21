# An agent at work, an agent that waits on an approval, and a shell.
# Not part of the shot.
WaitFor panes 1 10s
RenameWindow "api"
Run "~/agent.sh working 'Add a jitter option to the retry backoff'"
Sleep 600ms
Action split_horizontal
Sleep 600ms
RenameWindow "shell"
Run "alias herdr=\"$HERDR_BIN_PATH\"; clear"
Sleep 300ms
Focus "api"
Sleep 300ms
Action split_vertical
Sleep 600ms
RenameWindow "docs"
Run "~/agent.sh needs_input 'Update the README' approval"
Sleep 600ms
Focus "shell"
Sleep 4500ms
