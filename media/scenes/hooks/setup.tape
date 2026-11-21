# The log pane, two agents, a closed pane and a workspace switch that fire
# the hooks. The agents start late, so the focus has left their panes when
# they report: an alert skips the focused pane. Not part of the shot.
WaitFor panes 1 10s
RenameWindow "hooks"
Run "clear; tail -n 30 -f ~/hooks.log"
Sleep 800ms
Action split_horizontal
Sleep 600ms
RenameWindow "shell"
Run "clear"
Sleep 400ms
Focus "hooks"
Sleep 400ms
Action split_vertical
Sleep 600ms
RenameWindow "api"
Run "sleep 2; ~/agent.sh"
Sleep 400ms
Action split_horizontal
Sleep 600ms
RenameWindow "docs"
Run "sleep 2; agent-demo needs_input 'Update the README' approval"
Sleep 400ms
Focus "shell"
Sleep 400ms
Action split_vertical
Sleep 600ms
RenameWindow "scratch"
Sleep 400ms
CloseWindow "scratch"
Sleep 600ms
Focus "shell"
Sleep 800ms
SwitchWorkspace 2
Sleep 800ms
SwitchWorkspace 1
Sleep 800ms
Focus "shell"
WaitFor agent "done" in "api" 20s
WaitFor agent "needs_input" in "docs" 20s
Sleep 4000ms
