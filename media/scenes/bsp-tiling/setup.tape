# Three tiled panes. Not part of the shots.
WaitFor panes 1 10s
RenameWindow "log"
Run "clear; git --no-pager log --format='%h %<(26,trunc)%s'"
Sleep 400ms
Action split_vertical
Sleep 400ms
RenameWindow "files"
Run "clear; ls"
Sleep 400ms
Action split_horizontal
Sleep 400ms
RenameWindow "readme"
Run "clear; cat README.md"
Sleep 1500ms
