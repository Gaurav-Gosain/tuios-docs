#!/usr/bin/env bash
# The owner of a TML surface: it opens release.tml as a pane, runs a
# pretend release, and answers each "rerun" event with patches.
names=(vet test build sign)
cmds=("go vet ./..." "go test ./..." "go build ./cmd/tuios" "cosign sign-blob tuios")
secs=(1.2 4.8 2.6 0.7)
patch() { tuios tml patch "$id" "$1" >/dev/null; }
release() {
  patch "[{\"op\":\"replace\",\"path\":\"/run\",\"value\":$1},{\"op\":\"replace\",\"path\":\"/status\",\"value\":\"running\"},{\"op\":\"replace\",\"path\":\"/log\",\"value\":[]},{\"op\":\"replace\",\"path\":\"/pct\",\"value\":0},{\"op\":\"replace\",\"path\":\"/steps/0/secs\",\"value\":0},{\"op\":\"replace\",\"path\":\"/steps/1/secs\",\"value\":0},{\"op\":\"replace\",\"path\":\"/steps/2/secs\",\"value\":0},{\"op\":\"replace\",\"path\":\"/steps/3/secs\",\"value\":0}]"
  for i in 0 1 2 3; do
    echo "  patch: step ${names[$i]}"
    patch "[{\"op\":\"replace\",\"path\":\"/step\",\"value\":\"${names[$i]}\"},{\"op\":\"add\",\"path\":\"/log/-\",\"value\":\"${cmds[$i]}\"}]"
    sleep 0.7
    s=$(awk -v r="$1" -v s="${secs[$i]}" 'BEGIN{printf "%.1f", s*(r==1?1:0.8)}')
    patch "[{\"op\":\"replace\",\"path\":\"/steps/$i/secs\",\"value\":$s},{\"op\":\"replace\",\"path\":\"/pct\",\"value\":$(( (i + 1) * 25 ))}]"
  done
  patch '[{"op":"replace","path":"/status","value":"done"},{"op":"replace","path":"/step","value":"published"}]'
  echo "  patch: done"
}
tuios tml show release.tml --pane --events | while IFS= read -r line; do
  case "$line" in
    *'"type":"tml_opened"'*)
      id=$(sed 's/.*"surface":"\([^"]*\)".*/\1/' <<<"$line")
      echo "opened $id"
      release 1 ;;
    *'"name":"rerun"'*)
      echo "event: rerun"
      release 2 ;;
    *'"type":"tml_closed"'*|*'"reason"'*)
      echo "closed"; break ;;
  esac
done
