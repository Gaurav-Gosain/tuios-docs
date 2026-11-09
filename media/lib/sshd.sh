#!/usr/bin/env bash
# sshd.sh: the other machines of a hosts scene. A scene's setup.sh sources it.
#
# One sshd on 127.0.0.1:2222 stands in for every machine. It runs as the
# person (gaurav, the container's user) and lets in only their own login,
# with the key this script makes. The take's ssh config names the machines:
#
#   buildbox, gpu-box, nas   reach the sshd with the key: a machine to set up
#   oldbox                   offers another key, which the sshd refuses
#   *.ts.net                 the tailnet's names, as the tailscale stand-in
#                            in bin/ lists them
#
# The login lands in the container user's own home, /home/gaurav, where no
# tuios is installed, so a setup has something to install. Its prompt names
# the machine, and its ssh config reaches this machine back as laptop.
set -euo pipefail

fx=$TMPDIR/sshd
# ssh reads ~/.ssh from the passwd entry's home, not from HOME, so the keys,
# the known hosts and the config are there. Both ends of a link are the same
# user, so the one config names the machines and this one too. tuios reads
# the config from HOME for the ssh config tab, so a copy goes there.
remote=$(getent passwd "$(id -u)" | cut -d: -f6)
ssh_dir=$remote/.ssh
mkdir -p "$fx" "$ssh_dir" ~/.ssh bin
chmod 700 "$ssh_dir" ~/.ssh
rm -f "$ssh_dir"/id_ed25519* "$ssh_dir"/old_key*
ssh-keygen -q -t ed25519 -N '' -C gaurav@laptop -f "$ssh_dir/id_ed25519"
ssh-keygen -q -t ed25519 -N '' -C old -f "$ssh_dir/old_key"
ssh-keygen -q -t ed25519 -N '' -C host -f "$fx/host_key"
cp "$ssh_dir/id_ed25519.pub" "$fx/authorized_keys"

cat >"$fx/sshd_config" <<CFG
Port 2222
ListenAddress 127.0.0.1
HostKey $fx/host_key
PidFile $fx/sshd.pid
AuthorizedKeysFile $fx/authorized_keys
StrictModes no
UsePAM no
PasswordAuthentication no
KbdInteractiveAuthentication no
PrintMotd no
PrintLastLog no
Subsystem sftp internal-sftp
CFG
# An earlier take in the same container left its sshd on the port.
pkill -x -u "$(id -u)" sshd || true
sleep 0.3
/usr/sbin/sshd -f "$fx/sshd_config" -E "$fx/sshd.log"

# The host key is known, as it is for a machine you have logged in to.
echo "[127.0.0.1]:2222 $(cut -d' ' -f1,2 "$fx/host_key.pub")" >"$ssh_dir/known_hosts"

cat >"$ssh_dir/config" <<'CFG'
Host buildbox gpu-box nas laptop
  HostName 127.0.0.1
  Port 2222
  User gaurav
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes

Host oldbox
  HostName 127.0.0.1
  Port 2222
  User gaurav
  IdentityFile ~/.ssh/old_key
  IdentitiesOnly yes

Host *.ts.net
  HostName 127.0.0.1
  Port 2222
  User gaurav
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes
CFG
chmod 600 "$ssh_dir/config"
# The tab lists the other machines, not this one.
sed 's/^Host buildbox gpu-box nas laptop$/Host buildbox gpu-box nas/' "$ssh_dir/config" >~/.ssh/config
chmod 600 ~/.ssh/config

cat >"$remote/.bashrc" <<'RC'
PS1='\[\e[32m\]gaurav@buildbox\[\e[0m\] \[\e[34m\]~\[\e[0m\] $ '
RC
cp "$remote/.bashrc" "$remote/.bash_profile"
# An earlier take in the same container must not leave tuios there, or its
# daemon running.
pkill -f "^$remote/.local/bin/tuios" || true
rm -rf "$remote/.local/bin/tuios" "$remote/.config/tuios" "$remote/.local/state/tuios"

# The tailnet: this machine, three machines that answer ssh, one that is
# offline and a phone tuios does not run on.
cat >bin/tailscale <<'TS'
#!/usr/bin/env bash
cat <<'JSON'
{"Self": {"HostName": "laptop", "DNSName": "laptop.tail4f2c.ts.net.", "OS": "linux", "UserID": 1, "TailscaleIPs": ["100.101.12.1"], "Online": true},
 "Peer": {
  "k1": {"HostName": "buildbox", "DNSName": "buildbox.tail4f2c.ts.net.", "OS": "linux", "UserID": 1, "TailscaleIPs": ["100.101.12.7"], "Online": true},
  "k2": {"HostName": "gpu-box", "DNSName": "gpu-box.tail4f2c.ts.net.", "OS": "linux", "UserID": 1, "TailscaleIPs": ["100.101.12.9"], "Online": true},
  "k3": {"HostName": "mac-mini", "DNSName": "mac-mini.tail4f2c.ts.net.", "OS": "macOS", "UserID": 1, "TailscaleIPs": ["100.101.12.4"], "Online": true},
  "k4": {"HostName": "nas", "DNSName": "nas.tail4f2c.ts.net.", "OS": "linux", "UserID": 1, "TailscaleIPs": ["100.101.12.3"], "Online": false},
  "k5": {"HostName": "pixel", "DNSName": "pixel.tail4f2c.ts.net.", "OS": "android", "UserID": 1, "TailscaleIPs": ["100.101.12.11"], "Online": true}},
 "User": {"1": {"LoginName": "gaurav@example.com"}}}
JSON
TS
chmod +x bin/tailscale
