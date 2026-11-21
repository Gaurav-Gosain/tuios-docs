#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# A clean main, so the merge can run in the main checkout.
git commit -qam "Add a Delete handler to the store"
# The change the worktree's agent made.
cat >~/retry.go <<'GO'
package store

import "time"

// openRetries is how many times Open tries a busy database.
const openRetries = 5

// backoff is the wait before try n: 50ms, 100ms, 200ms and so on.
func backoff(n int) time.Duration {
	return 50 * time.Millisecond << n
}
GO
