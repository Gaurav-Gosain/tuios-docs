#!/usr/bin/env bash
# The tuios app icon, and a script that sends a PNG with kitty graphics the
# way chafa -f kitty does: base64 in chunks of 4096, a=T, placed in c x r cells.
cp "$MEDIA/../public/brand/app-icon-512.png" ~/icon.png
cat > ~/kitty-show <<'SHOW'
#!/usr/bin/env bash
data=$(base64 -w0 "$1")
first=1
while [ -n "$data" ]; do
  chunk=${data:0:4096}; data=${data:4096}
  more=0; [ -n "$data" ] && more=1
  if [ $first = 1 ]; then
    printf '\e_Gf=100,a=T,q=2,c=%s,r=%s,m=%s;%s\e\\' "$2" "$3" "$more" "$chunk"
    first=0
  else
    printf '\e_Gm=%s;%s\e\\' "$more" "$chunk"
  fi
done
printf '\n'
SHOW
chmod +x ~/kitty-show
