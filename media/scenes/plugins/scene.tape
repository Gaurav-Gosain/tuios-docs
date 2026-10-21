# What tuios found, and what the plugin holds. The pane is zoomed, so the
# table has the width of the screen.
Action toggle_zoom
Sleep 600ms
Run "tuios plugins list && tuios plugins info example.panes"
Sleep 2500ms
Action screenshot_screen
Sleep 1500ms
Action toggle_zoom
Sleep 600ms
# The plugin's pane. It holds read: it lists the panes, and the daemon
# refuses its try to type into one.
Run "clear; tuios plugins open example.panes list"
Sleep 4000ms
Action screenshot_screen
Sleep 1500ms
