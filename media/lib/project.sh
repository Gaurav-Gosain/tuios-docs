#!/usr/bin/env bash
# project.sh: fill the current folder with a small Go project and its git
# history, the same in every take. A scene's setup.sh sources this.
set -euo pipefail

mkdir -p cmd/api internal/store web
cat >go.mod <<'EOF'
module example.com/notes

go 1.26
EOF
cat >cmd/api/main.go <<'EOF'
package main

import (
	"log"
	"net/http"

	"example.com/notes/internal/store"
)

func main() {
	db := store.Open("notes.db")
	defer db.Close()

	mux := http.NewServeMux()
	mux.HandleFunc("GET /notes", db.List)
	mux.HandleFunc("POST /notes", db.Create)

	log.Println("listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
EOF
cat >internal/store/store.go <<'EOF'
// Package store keeps notes on disk.
package store

import "net/http"

// Store is an open notes database.
type Store struct{ path string }

// Open opens the database at path.
func Open(path string) *Store { return &Store{path: path} }

// Close releases the database.
func (s *Store) Close() error { return nil }

// List writes every note as JSON.
func (s *Store) List(w http.ResponseWriter, r *http.Request) {}

// Create stores the note in the request body.
func (s *Store) Create(w http.ResponseWriter, r *http.Request) {}
EOF
printf '# notes\n\nA small notes API.\n' >README.md
printf 'body { font: 16px/1.5 system-ui; }\n' >web/style.css

commit() { # DATE MESSAGE
  GIT_AUTHOR_DATE="$1" GIT_COMMITTER_DATE="$1" git commit -q -m "$2"
}
git init -q -b main
git add go.mod README.md && commit "2026-10-01T09:00:00" "Start the notes API"
git add cmd && commit "2026-10-02T10:30:00" "Serve the notes over HTTP"
git add internal && commit "2026-10-03T14:10:00" "Keep notes in a store"
git add web && commit "2026-10-05T16:45:00" "Add a stylesheet for the web view"
# A change in the working tree, so git status and the rail have something to show.
printf '\n// Delete removes a note.\nfunc (s *Store) Delete(w http.ResponseWriter, r *http.Request) {}\n' >>internal/store/store.go
