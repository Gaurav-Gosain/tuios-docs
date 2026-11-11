#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# The files the card carries. latency.png is in fixtures/.
cat > results.md <<'EOF'
## Retry jitter

- 200 runs, no wait over the 1800 ms cap
- p99 wait went from 1873 ms to 1612 ms
- the old default stays when `jitter = 0`
EOF
cat > fix.diff <<'EOF'
diff --git a/internal/store/retry.go b/internal/store/retry.go
--- a/internal/store/retry.go
+++ b/internal/store/retry.go
@@ -12,9 +12,13 @@ func backoff(attempt int) time.Duration {
 	d := base << attempt
-	if d > maxWait {
-		d = maxWait
-	}
-	return d
+	if jitter > 0 {
+		d += time.Duration(rand.Int63n(int64(d) * jitter / 100))
+	}
+	return min(d, maxWait)
 }
EOF
cat > ~/cards.sh <<'CARDS'
#!/usr/bin/env bash
set -e
t() { tuios task "$@" >/dev/null; }
t add -p $'## Retry plan\n\nAdd **jitter** to the backoff.\n\n- read internal/store/retry.go\n- keep the old default' make the backoff jitter configurable
t add -p 'Replace the map cache with the lru package.' port the cache to lru
t add -p 'Draft the rollout notes for the new store.' draft the rollout notes
t add -p 'Write the changelog for the next release.' write the changelog
t claim t1 -w api
t claim t2 -w cache
t attach t1 latency.png --note 'p99 wait after the fix'
t attach t1 fix.diff --note 'the change'
t attach t1 results.md --note 'the test run'
t stage t3 verify
clear
CARDS
chmod +x ~/cards.sh
