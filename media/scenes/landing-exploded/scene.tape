# Landing, exploded hero: four tiled panes, a floating scratch terminal over
# them, the rail and the dock. The cells, not a picture: the page splits this
# one screen into its layers.
WaitFor panes 1 10s
RenameWindow "main.go"
Run "clear; nvim -c 'set notermguicolors' cmd/api/main.go"
Sleep 600ms
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
# The tiles alone first: the scratch box covers part of them, and the page
# needs the cells under it.
Action screenshot_screen
Sleep 800ms
Action toggle_scratch
Sleep 800ms
Run "clear; tuios ls"
Sleep 4500ms
Action screenshot_screen
Sleep 1500ms
