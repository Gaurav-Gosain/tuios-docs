# Landing: panes, the rail and agent states.
WaitFor panes 1 10s
RenameWindow "main.go"
Run "clear; cat -n cmd/api/main.go"
Sleep 400ms
Action split_vertical
Sleep 400ms
RenameWindow "diff"
Run "clear; git --no-pager diff --stat; git --no-pager diff cmd/api"
Sleep 400ms
Action split_horizontal
Sleep 400ms
RenameWindow "tests"
Run "agent-demo working 'Add tests for the store'"
Sleep 400ms
Focus "main.go"
Sleep 300ms
Action split_horizontal
Sleep 400ms
RenameWindow "api"
Run "agent-demo needs_input 'Add a delete endpoint' approval"
Sleep 400ms
Focus "main.go"
Sleep 4500ms
Action screenshot_screen
Sleep 1500ms
