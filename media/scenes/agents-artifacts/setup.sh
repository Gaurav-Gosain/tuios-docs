#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
mkdir -p ~/.claude && tuios integration install claude-code --no-skill >/dev/null
# The documents the release agent shows: the test run dashboard of the tml
# page, and a form with one text field.
cp "$MEDIA/../tools/libshots/scenes/tml/test-run.tml" test-run.tml
cat >note.tml <<'TML'
<tml version="1" title="Release note">
  <state>{"note": ""}</state>
  <col pad="1" gap="1">
    <text>Write one line about this change for the release notes.</text>
    <form on-submit="close(form.note)">
      <input name="note" bind="state.note" label="Note" placeholder="What changed for the user"/>
      <button key="y" kind="primary" submit="true">Send</button>
    </form>
  </col>
</tml>
TML
# What the release agent runs: it shows the dashboard and closes it, takes a
# screenshot, then asks for the release note and waits for the answer.
cat >release.sh <<'SH'
clear
tuios set-agent-state working -m 'Write the release note' >/dev/null
id=$(tuios tml show test-run.tml --pane | cut -d" " -f1)
sleep 1.5
tuios tml close "$id" '"seen"' >/dev/null
tuios screenshot -o "$HOME/project/retry.png" >/dev/null
tuios set-agent-state idle -m 'Asked for the release note' >/dev/null
tuios tml show note.tml --wait --width 64 --height 12
SH
