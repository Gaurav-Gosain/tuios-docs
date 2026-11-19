#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# A change in the working tree, so the diff pane has something to show.
sed -i 's|log.Println("listening on :8080")|addr := envOr("ADDR", ":8080")\n\tlog.Println("listening on", addr)|; s|http.ListenAndServe(":8080", mux)|http.ListenAndServe(addr, mux)|' cmd/api/main.go
cat >>cmd/api/main.go <<'GO'

// envOr returns the variable name, or def when it is empty.
func envOr(name, def string) string {
	if v := os.Getenv(name); v != "" {
		return v
	}
	return def
}
GO
cp "$MEDIA/scenes/gallery-ember/tests.sh" tests.sh
