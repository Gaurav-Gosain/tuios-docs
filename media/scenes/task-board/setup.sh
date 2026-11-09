#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
mkdir -p ~/.claude && tuios integration install claude-code --no-skill >/dev/null
# The cards, added and handed out once the agent panes exist. setup.tape
# runs it in the shell pane.
cat > ~/cards.sh <<'CARDS'
#!/usr/bin/env bash
set -e
t() { tuios task "$@" >/dev/null; }
t add -p 'Add a jitter option to the retry backoff, with a test.' wire the retry jitter
t add -p 'Replace the map cache with the lru package.' port the cache to lru
t add -p 'Write the changelog for the next release.' write the changelog
t add -p 'Draft the rollout notes for the new store.' draft the rollout notes
t add -p 'Split the auth middleware into its own package.' split the auth middleware
t add -p 'Add retries to the HTTP client.' add retries to the client
t add --stage done bump the go toolchain
t claim t1 -w api-1
t claim t2 -w api-2
t claim t4 -w docs-1
t stage t4 verify
t stage t6 review
t block t5 waits on t1
clear
CARDS
chmod +x ~/cards.sh
