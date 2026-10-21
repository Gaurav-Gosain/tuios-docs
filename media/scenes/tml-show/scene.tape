# tml show: a dashboard as a pane, then a question as a popup. The pane shot
# zooms the surface so it fills the frame. Then the focus goes back to the
# shell, which runs the popup: a surface does not take the focus.
WaitFor panes 1 10s
RenameWindow "shell"
Run "tuios tml show test-run.tml --pane"
Sleep 1500ms
Action next_window
Sleep 300ms
Action toggle_zoom
Sleep 4500ms
Action screenshot_screen
Sleep 1000ms
Action toggle_zoom
Sleep 300ms
Action next_window
Sleep 300ms
Run "answer=$(tuios tml show deploy.tml --wait --width 60 --height 7)"
Sleep 4800ms
Action screenshot_screen
Sleep 1500ms
