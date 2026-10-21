# One pane. It tries to give a plugin admin, then tries again with every
# TUIOS_ variable cut. Both are refused.
WaitFor panes 1 10s
RenameWindow "shell"
Run "clear"
Sleep 500ms
Run "tuios plugins install ~/layout --grant admin --yes"
Sleep 2500ms
Run "unset $(env | grep -o '^TUIOS_[A-Z_]*'); env | grep -c TUIOS_"
Sleep 1000ms
Run "tuios plugins install ~/layout --grant admin --yes"
Sleep 3500ms
Action screenshot_screen
Sleep 1500ms
