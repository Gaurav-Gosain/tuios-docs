# Three panes: an agent, a server and a shell. Not part of the shots.
WaitFor panes 1 10s
RenameWindow "api"
Run "claude-demo"
Sleep 600ms
Action split_vertical
Sleep 400ms
RenameWindow "server"
Run "python3 -m http.server 8080"
Sleep 400ms
Action split_horizontal
Sleep 400ms
RenameWindow "shell"
Run "clear"
Sleep 2000ms
