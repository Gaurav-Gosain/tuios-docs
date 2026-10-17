# Four panes with something in each. Not part of the clip.
WaitFor panes 1 10s
Run "git log --oneline"
Sleep 300ms
Action split_vertical
Sleep 300ms
Run "git status --short"
Sleep 300ms
Action split_horizontal
Sleep 300ms
Run "ls internal/store"
Sleep 300ms
Action split_vertical
Sleep 300ms
Run "cat README.md"
Sleep 600ms
