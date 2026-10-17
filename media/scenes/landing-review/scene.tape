# Landing: the review view of the pane's changes.
WaitFor panes 1 10s
Run "clear; git --no-pager diff --stat"
Sleep 4500ms
Press "ctrl+b v"
Sleep 1500ms
Action screenshot_screen
Sleep 1500ms
