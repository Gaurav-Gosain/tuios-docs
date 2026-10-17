# Five agents in other states. api is a Claude Code conversation the
# agents view reads from its transcript. Not part of the shot.
WaitFor panes 1 10s
RenameWindow "api"
Run "claude-demo"
Sleep 600ms
Action split_vertical
Sleep 400ms
RenameWindow "review"
Run "agent-demo working 'Review the store package'"
Sleep 400ms
Action split_horizontal
Sleep 400ms
RenameWindow "docs"
Run "agent-demo needs_input 'Update the README' approval"
Sleep 400ms
Focus "api"
Sleep 300ms
Action split_horizontal
Sleep 400ms
RenameWindow "web"
Run "agent-demo errored 'Fix the vet warnings'"
Sleep 1000ms
