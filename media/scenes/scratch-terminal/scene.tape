# The scratch terminal, the action Ctrl+B g runs. A quick look at the tree in it.
Action toggle_scratch
Sleep 1500ms
Run "clear; git status --short; git --no-pager diff --stat"
Sleep 4500ms
Action screenshot_screen
Sleep 1500ms
