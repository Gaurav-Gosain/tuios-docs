#!/usr/bin/env bash
# A plugin pane that holds only the read grant. It lists the panes, then
# tries to type into one, which read does not allow.
echo "tuios list-windows -s demo"
echo
tuios list-windows -s demo 2>&1
echo
echo "tuios send-text -s demo -w shell 'echo hello'"
tuios send-text -s demo -w shell 'echo hello' 2>&1
exec sleep 100000
