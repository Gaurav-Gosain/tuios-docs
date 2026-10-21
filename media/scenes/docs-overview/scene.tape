# The docs index: panes, the rail and agent states, at 100 columns.
# Short output in the panes, so no line wraps.
WaitFor panes 1 10s
RenameWindow "log"
Run "clear; git --no-pager log --format=%s"
Sleep 400ms
Action split_vertical
Sleep 400ms
RenameWindow "diff"
Run "clear; git --no-pager diff --stat=36"
Sleep 400ms
Action split_horizontal
Sleep 400ms
RenameWindow "tests"
Run "agent-demo working 'Add tests for the store'"
Sleep 400ms
Focus "log"
Sleep 300ms
Action split_horizontal
Sleep 400ms
RenameWindow "api"
Run "agent-demo needs_input 'Add a delete endpoint' approval"
Sleep 400ms
Focus "log"
Sleep 4500ms
Action screenshot_screen
Sleep 1500ms
