# A gallery look: three tiled panes (code, a diff and a test run), with the
# rail and the dock. The code pane has the focus, so its border shows the
# gradient.
WaitFor panes 1 10s
RenameWindow "main.go"
Run "clear; cat -n cmd/api/main.go"
Sleep 400ms
Action split_vertical
Sleep 400ms
RenameWindow "diff"
Run "clear; git --no-pager diff --color=always cmd/api"
Sleep 400ms
Action split_horizontal
Sleep 400ms
RenameWindow "tests"
Run "bash tests.sh"
Sleep 400ms
Focus "main.go"
Sleep 4500ms
Action screenshot_screen
Sleep 1500ms
