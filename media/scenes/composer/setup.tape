# Three agents. api reports done once the focus has moved on, so its
# finished turn stays in the Inbox. Not part of the shot.
WaitFor panes 1 10s
RenameWindow "api"
Run "sleep 2 && agent-demo done 'Add jitter to the retry backoff'"
Sleep 400ms
Action split_vertical
Sleep 400ms
RenameWindow "review"
Run "agent-demo working 'Review the store package'"
Sleep 400ms
Action split_horizontal
Sleep 400ms
RenameWindow "docs"
Run "agent-demo needs_input 'Update the README' approval"
Sleep 4500ms
