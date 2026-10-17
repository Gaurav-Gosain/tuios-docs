# Getting started: one pane becomes three tiled panes, then a zoom.
Sleep 500ms
Run "git log --oneline"
Sleep 900ms
Action split_vertical
Sleep 600ms
Run "git log -1 --stat --format='%h %s'"
Sleep 1s
Action split_horizontal
Sleep 600ms
Run "git status --short"
Sleep 1200ms
Action toggle_zoom
Sleep 1500ms
Action toggle_zoom
Sleep 800ms
