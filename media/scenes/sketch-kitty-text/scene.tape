# A deploy pipeline as a kitty picture, and as box-drawing text beside it.
# The panes take their final size first: a kitty picture keeps the width it
# was drawn at.
WaitFor panes 1 10s
RenameWindow "kitty"
Action split_vertical
Sleep 400ms
# The text drawing goes left to right from 116 columns. Below that it
# stacks, and the stack is taller than the pane.
Action resize_width_70
Sleep 400ms
RenameWindow "text"
Run "clear"
Sleep 300ms
Run "tuios mermaid -f text pipeline.mmd"
Sleep 800ms
Action select_window_1
Sleep 400ms
Run "clear"
Sleep 300ms
Run "tuios mermaid pipeline.mmd"
Sleep 4800ms
Action screenshot_screen
Sleep 1500ms
