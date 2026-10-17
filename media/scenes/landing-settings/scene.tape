# Landing: the settings page, searched for theme.
WaitFor panes 1 10s
Run "clear; git log --oneline"
Sleep 400ms
Action split_vertical
Sleep 400ms
Run "clear; git --no-pager diff --stat"
Sleep 4500ms
Action open_settings
Sleep 800ms
Press "/ t h e m e"
Sleep 1200ms
Action screenshot_screen
Sleep 1500ms
