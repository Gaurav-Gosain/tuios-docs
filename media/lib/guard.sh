#!/usr/bin/env bash
# guard.sh: stop a media script that would change the account's own files.
#
# Some scene fixtures, such as sshd.sh, write the home folder of the passwd
# entry: they make ssh keys, write the ssh config and the shell files, and
# remove tuios. In the docs media container that home is a throwaway. On a
# person's machine it is their real home, and those steps destroy their ssh
# keys and their config. A script that changes such files sources this file
# first and calls both checks before it changes anything.
#
# A run is allowed only when both are true:
#
#   - The process runs in a container: /.dockerenv (Docker) or
#     /run/.containerenv (Podman) exists.
#   - The home folder holds the file .docs-media-throwaway. The container
#     image makes it. No real home has it.

# docs_media_guard NAME: exit 1 unless this is the docs media container.
docs_media_guard() {
  if [[ ! -f /.dockerenv && ! -f /run/.containerenv ]]; then
    echo "docs-media: $1 runs only in the docs media container. It changes the ssh keys, the ssh config, the shell files and tuios of the account's home. Run the scene in the container." >&2
    exit 1
  fi
}

# docs_media_guard_home DIR: exit 1 unless DIR is a throwaway home.
docs_media_guard_home() {
  if [[ ! -f $1/.docs-media-throwaway ]]; then
    echo "docs-media: $1 has no .docs-media-throwaway file, so it can be a real home. The script changes files there, so it stops." >&2
    exit 1
  fi
}
