# The restart from the app: the dialog shows the plan, r restarts, and the
# client comes back in the same session. The tape ends at r: the daemon that
# plays it stops.
Run "clear"
Sleep 500ms
Action restart_daemon
Sleep 3500ms
Press "r"
