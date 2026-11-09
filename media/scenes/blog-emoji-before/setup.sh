#!/usr/bin/env bash
# Emoji as escapes, so the scene's own files hold none.
cat > ~/emoji <<'SHOW'
#!/usr/bin/env bash
printf 'Flags        \U1F1E9\U1F1EA  \U1F1EF\U1F1F5  \U1F1E7\U1F1F7  \U1F1FA\U1F1E6\n'
printf 'Keycaps      1️⃣  2️⃣  #️⃣\n'
printf 'Skin tones   \U1F44B\U1F3FB  \U1F44B\U1F3FD  \U1F44D\U1F3FF\n'
printf 'ZWJ          \U1F468‍\U1F469‍\U1F467  \U1F469‍\U1F4BB  \U1F3F3️‍\U1F308\n'
printf 'Single       \U2705  \U1F680  \U1F525  \U1F4E6\n'
SHOW
chmod +x ~/emoji
