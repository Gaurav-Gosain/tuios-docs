#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# More changes, so the diff and the review have several files to show.
sed -i 's|log.Println("listening on :8080")|addr := envOr("ADDR", ":8080")\n\tmux.HandleFunc("GET /health", health)\n\tlog.Println("listening on", addr)|; s|http.ListenAndServe(":8080", mux)|http.ListenAndServe(addr, mux)|' cmd/api/main.go
cat >>cmd/api/main.go <<'GO'

// health answers the load balancer.
func health(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}

// envOr returns the variable name, or def when it is empty.
func envOr(name, def string) string {
	if v := os.Getenv(name); v != "" {
		return v
	}
	return def
}
GO
sed -i 's/font: 16px/font: 15px/' web/style.css
