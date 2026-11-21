#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# Three agent turns, each one an edit between working and done. The daemon
# saves a checkpoint at the end of each turn. setup.tape runs it in the pane.
cat >~/turns.sh <<'TURNS'
#!/usr/bin/env bash
cd ~/project
bold=$'\e[1m' grn=$'\e[32m' acc=$'\e[38;5;141m' dim=$'\e[2m' off=$'\e[0m'
start() { printf '%s>%s %s\n' "$bold" "$off" "$1"; tuios set-agent-state working -m "$1" >/dev/null; sleep 1.5; }
finish() { printf '  %sEdit%s %s\n\n' "$grn" "$off" "$2"; sleep 0.5; tuios set-agent-state done -m "$1" >/dev/null; sleep 3; }
clear
printf '%s* agent%s  %s\n\n' "$acc$bold" "$off" "$dim~/project$off"

p='Register the Delete route'
start "$p"
sed -i 's|\tmux.HandleFunc("POST /notes", db.Create)|&\n\tmux.HandleFunc("DELETE /notes/{id}", db.Delete)|' cmd/api/main.go
finish "$p" 'cmd/api/main.go +1'

p='Read the listen address from ADDR'
start "$p"
sed -i 's|\tlog.Println("listening on :8080")|\taddr := os.Getenv("ADDR")\n\tif addr == "" {\n\t\taddr = ":8080"\n\t}\n\tlog.Println("listening on", addr)|; s|http.ListenAndServe(":8080", mux)|http.ListenAndServe(addr, mux)|; s|\t"net/http"|&\n\t"os"|' cmd/api/main.go
finish "$p" 'cmd/api/main.go +6 -2'

p='Document the endpoints in the README'
start "$p"
printf '\n## Endpoints\n\n- GET /notes lists the notes.\n- POST /notes adds a note.\n- DELETE /notes/{id} removes a note.\n' >>README.md
finish "$p" 'README.md +6'
printf '  %sDone.%s Three turns, three checkpoints.\n' "$grn" "$off"
exec sleep 100000
TURNS
chmod +x ~/turns.sh
