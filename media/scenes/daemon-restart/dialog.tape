# The same plan in the app. r restarts the daemon, and this client starts
# again in the same session. The tape ends here: the daemon that plays it
# stops.
Run "clear"
Action restart_daemon
Sleep 3000ms
Action screenshot_screen
Sleep 1500ms
Press "r"
