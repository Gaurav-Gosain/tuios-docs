# One pane: a PNG sent with kitty graphics, drawn as block characters.
WaitFor panes 1 10s
RenameWindow "kitty graphics"
Run "clear; ~/kitty-show ~/icon.png 36 18; echo 'kitty graphics, drawn as block characters'"
Sleep 2500ms
Action screenshot_screen
Sleep 1500ms
