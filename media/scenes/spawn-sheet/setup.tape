# Two agents, so the agents view behind the sheet is not empty. Not part
# of the shot.
WaitFor panes 1 10s
RenameWindow "api"
Run "claude-demo"
Sleep 600ms
Action split_vertical
Sleep 400ms
RenameWindow "review"
Run "agent-demo working 'Review the store package'"
Sleep 3000ms
