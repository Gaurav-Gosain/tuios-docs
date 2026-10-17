#!/usr/bin/env python3
"""Run one docs media scene against a real tuios and record it.

Usage: rig.py SCENE_DIR BUILD_DIR [--theme ID]

A scene is a folder under media/scenes/ with:

  scene.json   {"cols", "rows", "shots": [names], "clip": bool, "tail": s}
  setup.tape   optional. Played first. It is not part of a clip.
  scene.tape   played second. A clip covers this tape and "tail" seconds.
               A shot scene ends its tape with `Action screenshot_screen`,
               once per name in "shots".
  setup.sh     optional. Runs before tuios starts, in the scene's work
               folder, with the scene's environment. Use it for fixtures.
  config.toml  optional. Appended to media/base.toml.
  fixtures/    optional. Copied to the work folder, ~/project.

What it does:

  1. Builds a throwaway HOME and XDG tree under BUILD_DIR/env, and a short
     XDG_RUNTIME_DIR under /tmp, so the daemon it starts can never be yours.
  2. Starts `tuios new -s demo` in a PTY of cols x rows. That starts a daemon
     in the throwaway runtime folder and attaches a client to it.
  3. Plays setup.tape, then scene.tape, with `tuios tape exec`, which the
     attached client plays.
  4. Writes BUILD_DIR/session.cast (asciicast v2, the client's output with
     times) and BUILD_DIR/marks.json (when scene.tape started and ended).
  5. Moves each screenshot the tape took to BUILD_DIR/<name>.png.
  6. Stops the daemon with kill-server and removes the runtime folder.

The PTY answers the queries a Bubble Tea program sends at start, so tuios
sees a capable truecolor terminal and does not wait on silence.
"""

import fcntl
import glob
import json
import os
import pty
import re
import select
import shutil
import signal
import struct
import subprocess
import sys
import tempfile
import termios
import time
import tomllib

HERE = os.path.dirname(os.path.abspath(__file__))

# A Go time layout made only of 0, 7, 8, 9 and colons formats to itself, so
# the dock clock reads the same in every take.
PINNED_CLOCK = "09:00:00"

# The host terminal's colours, which tuios asks for at start. A tuios theme
# recolours ANSI 0 to 15, but a cell with the default colours shows the host's,
# so a light scene needs a light host. render.mjs draws with the same table.
PALETTES = json.load(open(os.path.join(HERE, "palettes.json")))
PALETTE = {"fg": "#cdd6f4", "bg": "#1e1e2e"}


def rgb(hexcolor):
    h = hexcolor.lstrip("#")
    return "rgb:" + "/".join(h[i : i + 2] * 2 for i in (0, 2, 4))


RESPONDERS = [
    (re.compile(rb"\x1b\[0?c"), lambda m: b"\x1b[?62;22c"),
    (re.compile(rb"\x1b\[>0?q"), lambda m: b"\x1bP>|xterm.js(docs)\x1b\\"),
    (re.compile(rb"\x1b\]10;\?(\x07|\x1b\\)"), lambda m: f"\x1b]10;{rgb(PALETTE['fg'])}\x1b\\".encode()),
    (re.compile(rb"\x1b\]11;\?(\x07|\x1b\\)"), lambda m: f"\x1b]11;{rgb(PALETTE['bg'])}\x1b\\".encode()),
]


def merge(into, other):
    """Merge the TOML tables of other into into, other winning."""
    for k, v in other.items():
        if isinstance(v, dict) and isinstance(into.get(k), dict):
            merge(into[k], v)
        else:
            into[k] = v
    return into


def to_toml(table, prefix=""):
    """Write a parsed config back as TOML: keys first, then sub-tables."""
    def value(v):
        if isinstance(v, bool):
            return "true" if v else "false"
        if isinstance(v, (int, float)):
            return str(v)
        if isinstance(v, list):
            return "[" + ", ".join(value(x) for x in v) + "]"
        return json.dumps(v)
    out = [f"{k} = {value(v)}" for k, v in table.items() if not isinstance(v, dict)]
    for k, v in table.items():
        if isinstance(v, dict):
            name = f"{prefix}.{k}" if prefix else k
            out.append(f"\n[{name}]")
            out.append(to_toml(v, name))
    return "\n".join(x for x in out if x != "") + "\n"


def own_sockets():
    paths = {os.path.join("/tmp", f"tuios-{os.getuid()}", "tuios.sock")}
    if os.environ.get("XDG_RUNTIME_DIR"):
        paths.add(os.path.join(os.environ["XDG_RUNTIME_DIR"], "tuios", "tuios.sock"))
    return {os.path.realpath(p) for p in paths}


def main():
    args = sys.argv[1:]
    theme = None
    if "--theme" in args:
        i = args.index("--theme")
        theme = args[i + 1]
        del args[i : i + 2]
    scene_dir, build = os.path.abspath(args[0]), os.path.abspath(args[1])
    host = PALETTES[theme or "catppuccin_mocha"]
    PALETTE.update(fg=host["foreground"], bg=host["background"])
    scene = json.load(open(os.path.join(scene_dir, "scene.json")))
    cols, rows = scene.get("cols", 160), scene.get("rows", 45)
    tuios = os.environ.get("TUIOS_BIN") or shutil.which("tuios")
    if not tuios:
        sys.exit("rig: set TUIOS_BIN or put tuios on PATH")
    tuios = os.path.abspath(tuios)

    shutil.rmtree(build, ignore_errors=True)
    env_root = os.path.join(build, "env")
    dirs = {
        k: os.path.join(env_root, v)
        for k, v in {
            "HOME": "home",
            "XDG_CONFIG_HOME": "config",
            "XDG_STATE_HOME": "state",
            "XDG_DATA_HOME": "data",
            "XDG_CACHE_HOME": "cache",
            "TMPDIR": "tmp",
        }.items()
    }
    for d in dirs.values():
        os.makedirs(d, mode=0o700)
    runtime = tempfile.mkdtemp(prefix="tdm-", dir="/tmp")
    dirs["XDG_RUNTIME_DIR"] = runtime
    socket = os.path.realpath(os.path.join(runtime, "tuios", "tuios.sock"))
    if socket in own_sockets():
        sys.exit(f"rig: refusing to run: {socket} is your own daemon's socket")

    shots_dir = os.path.join(build, "raw")
    os.makedirs(shots_dir)

    # The config: media/base.toml, the scene's own on top, then what the rig
    # pins. The tables are merged, because TOML refuses a table twice.
    config = tomllib.load(open(os.path.join(HERE, "base.toml"), "rb"))
    own = os.path.join(scene_dir, "config.toml")
    if os.path.exists(own):
        merge(config, tomllib.load(open(own, "rb")))
    merge(config, {
        "screenshot": {
            "directory": shots_dir, "format": "png", "frame": "none", "copy": False,
            "preview": False, "scale": 2,
            # scripts/docs-media.sh sets the font. The renderer has one file
            # for every weight, so a shot draws bold in the regular face.
            "font_file": os.environ.get("DOCS_MEDIA_FONT")
            or "/usr/share/fonts/TTF/JetBrainsMonoNerdFontMono-Regular.ttf",
        },
    })
    config.setdefault("dock", {}).setdefault("clock", {}).setdefault("format", PINNED_CLOCK)
    if theme:
        config.setdefault("appearance", {})["theme"] = theme
    config = "# Written by rig.py from media/base.toml and the scene.\n" + to_toml(config)
    os.makedirs(os.path.join(dirs["XDG_CONFIG_HOME"], "tuios"))
    with open(os.path.join(dirs["XDG_CONFIG_HOME"], "tuios", "config.toml"), "w") as f:
        f.write(config)

    work = os.path.join(dirs["HOME"], "project")
    fixtures = os.path.join(scene_dir, "fixtures")
    if os.path.isdir(fixtures):
        shutil.copytree(fixtures, work, symlinks=True)
    else:
        os.makedirs(work)
    shared_bin = os.path.join(HERE, "bin")
    with open(os.path.join(dirs["HOME"], ".bashrc"), "w") as f:
        f.write(
            scene.get(
                "bashrc",
                "PS1='\\[\\e[35m\\]\\W\\[\\e[0m\\] \\[\\e[34m\\]>\\[\\e[0m\\] '\n"
                "export LS_COLORS='di=34:ln=36:ex=32'\nalias ls='ls --color=auto'\n",
            )
        )
    env = {
        "PATH": os.pathsep.join(
            [os.path.join(work, "bin"), shared_bin, os.path.dirname(tuios), "/usr/bin", "/bin"]
        ),
        "TERM": "xterm-256color",
        "COLORTERM": "truecolor",
        "LANG": "en_US.UTF-8",
        "SHELL": "/bin/bash",
        "USER": "demo",
        "HOSTNAME": "demo",
        "GIT_AUTHOR_NAME": "Demo",
        "GIT_AUTHOR_EMAIL": "",
        "GIT_COMMITTER_NAME": "Demo",
        "GIT_COMMITTER_EMAIL": "",
        "GIT_CONFIG_GLOBAL": "/dev/null",
        "XDG_CONFIG_DIRS": dirs["XDG_CONFIG_HOME"],
        "XDG_DATA_DIRS": dirs["XDG_DATA_HOME"],
        "TUIOS_NO_SOUND": "1",
        "MEDIA": HERE,
        **dirs,
        **scene.get("env", {}),
    }
    if os.path.exists(os.path.join(scene_dir, "setup.sh")):
        subprocess.run(
            ["/bin/bash", os.path.join(scene_dir, "setup.sh")],
            env=env, cwd=work, check=True, stdin=subprocess.DEVNULL, timeout=120,
        )

    pid, fd = pty.fork()
    if pid == 0:
        os.chdir(work)
        os.execve(tuios, [tuios, "new", scene.get("session", "demo")], env)
    fcntl.ioctl(fd, termios.TIOCSWINSZ, struct.pack("HHHH", rows, cols, 0, 0))
    os.kill(pid, signal.SIGWINCH)

    t0 = time.monotonic()
    events = []
    tail = b""

    def now():
        return time.monotonic() - t0

    def pump(until, proc=None):
        nonlocal tail
        while now() < until:
            if proc is not None and proc.poll() is not None:
                return
            r, _, _ = select.select([fd], [], [], 0.01)
            if not r:
                continue
            try:
                data = os.read(fd, 65536)
            except OSError:
                return
            if not data:
                return
            events.append([round(now(), 6), data])
            scan = tail + data
            for rx, reply in RESPONDERS:
                for m in rx.finditer(scan):
                    if m.end() > len(tail):
                        os.write(fd, reply(m))
            for m in re.finditer(rb"\x1b\[6n", scan):
                if m.end() > len(tail):
                    os.write(fd, f"\x1b[{rows};{cols}R".encode())
            tail = scan[-64:]

    def run_tape(name, limit):
        path = os.path.join(scene_dir, name)
        proc = subprocess.Popen(
            [tuios, "tape", "exec", "--timeout", f"{int(limit)}s", path],
            env=env, cwd=work, stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        )
        pump(now() + limit + 5, proc)
        out = proc.communicate(timeout=10)[0].decode(errors="replace")
        if proc.returncode != 0:
            raise SystemExit(f"rig: {name} failed:\n{out}")

    status = 0
    try:
        pump(scene.get("boot", 3.0))
        if os.path.exists(os.path.join(scene_dir, "setup.tape")):
            run_tape("setup.tape", 120)
            pump(now() + scene.get("settle", 0.8))
        start = now()
        run_tape("scene.tape", scene.get("limit", 120))
        end = now()
        pump(end + scene.get("tail", 1.0))
        with open(os.path.join(build, "marks.json"), "w") as f:
            json.dump({"start": start, "end": end, "stop": now(), "cols": cols, "rows": rows,
                       "palette": theme or "catppuccin_mocha"}, f)
    except SystemExit as e:
        print(e, file=sys.stderr)
        status = 1
    finally:
        with open(os.path.join(build, "session.cast"), "w") as f:
            f.write(json.dumps({"version": 2, "width": cols, "height": rows}) + "\n")
            for t, data in events:
                f.write(json.dumps([t, "o", data.decode("utf-8", errors="replace")]) + "\n")
        subprocess.run([tuios, "kill-server"], env=env, stdin=subprocess.DEVNULL,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=20)
        try:
            os.kill(pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        try:
            os.waitpid(pid, 0)
        except ChildProcessError:
            pass
        shutil.rmtree(runtime, ignore_errors=True)

    taken = sorted(glob.glob(os.path.join(shots_dir, "*.png")), key=os.path.getmtime)
    names = scene.get("shots", [])
    if len(taken) != len(names):
        print(f"rig: the tape took {len(taken)} screenshots and scene.json names {len(names)}", file=sys.stderr)
        status = 1
    for name, path in zip(names, taken):
        shutil.move(path, os.path.join(build, f"{name}.png"))
    sys.exit(status)


if __name__ == "__main__":
    main()
