# tml show: a dashboard as a pane, then a question as a popup. Run types
# into the shell pane, which keeps the focus: a surface does not take it.
WaitFor panes 1 10s
Run "tuios tml show test-run.tml --pane"
Sleep 4500ms
Action screenshot_screen
Sleep 1500ms
Run "answer=$(tuios tml show deploy.tml --wait --width 64 --height 7)"
Sleep 4500ms
Action screenshot_screen
Sleep 1500ms
