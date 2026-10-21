# What tuios found, and what the plugin holds.
Run "tuios plugins list && tuios plugins info example.panes"
Sleep 2500ms
Action screenshot_screen
Sleep 1500ms
# The plugin's pane. It holds read: it lists the panes, and the daemon
# refuses its try to type into one.
Run "clear; tuios plugins open example.panes list"
Sleep 4000ms
Action screenshot_screen
Sleep 1500ms
