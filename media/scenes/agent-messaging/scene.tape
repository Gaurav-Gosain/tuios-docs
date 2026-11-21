# The lead leaves review a message, and review reads it.
Run "tuios send-agent-message -w review --from $TUIOS_PANE_ID --subject 'retest please' 'rebased onto main, please retest'"
Sleep 1200ms
Focus "review"
Sleep 400ms
Run "tuios read-agent-messages -w $TUIOS_PANE_ID --unread"
Sleep 4500ms
Action screenshot_screen
Sleep 1500ms
