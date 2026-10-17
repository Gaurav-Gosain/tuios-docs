#!/usr/bin/env python3
"""Draw fixtures/latency.png, the dashboard graph the composer scene attaches.

Usage: python3 latency.py OUT.png

A made-up p99 latency series for the api service over one hour, with the
spike past the 1800ms cap that the reply talks about. The numbers are
generated here from a fixed seed, so the picture is the same on every run.
The strokes are thick because the reply editor shows the picture 3 rows high.
"""

import sys

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib import font_manager

# Catppuccin Mocha, the scene's dark palette.
BASE, MANTLE, SURFACE1 = "#1e1e2e", "#181825", "#45475a"
TEXT, SUBTEXT, OVERLAY = "#cdd6f4", "#a6adc8", "#6c7086"
BLUE, RED = "#89b4fa", "#f38ba8"

for f in font_manager.findSystemFonts():
    if "GeistMonoNerdFontMono" in f:
        font_manager.fontManager.addfont(f)
plt.rcParams["font.family"] = "GeistMono Nerd Font Mono"

rng = np.random.default_rng(7)
t = np.linspace(0, 60, 241)
p99 = 420 + 40 * np.sin(t / 6) + rng.normal(0, 18, t.size)
spike = np.exp(-(((t - 41) / 1.6) ** 2))
p99 += 1520 * spike
peak = int(np.argmax(p99))
# The test log in setup.sh reports a 1873ms wait; make the graph agree.
p99 += (1873 - p99[peak]) * spike / spike[peak]

fig = plt.figure(figsize=(12.8, 7.2), dpi=100, facecolor=MANTLE)
ax = fig.add_axes([0.075, 0.12, 0.895, 0.7], facecolor=BASE)

ax.fill_between(t, p99, 0, color=BLUE, alpha=0.18, linewidth=0)
ax.plot(t, p99, color=BLUE, linewidth=4, solid_joinstyle="round", solid_capstyle="round")
ax.axhline(1800, color=RED, linewidth=2.5, linestyle=(0, (6, 4)))
ax.text(0.8, 1840, "cap 1800ms", color=RED, fontsize=15, va="bottom")
ax.plot(t[peak], p99[peak], "o", color=RED, markersize=14,
        markeredgecolor=BASE, markeredgewidth=3, zorder=5)
ax.annotate(f"{p99[peak]:.0f}ms", (t[peak], p99[peak]), xytext=(18, 4),
            textcoords="offset points", color=TEXT, fontsize=17, fontweight="bold",
            va="center")

ax.set_xlim(0, 60)
ax.set_ylim(0, 2200)
ax.set_xticks(range(0, 61, 10), [f"14:{m:02d}" for m in range(0, 61, 10)][:-1] + ["15:00"])
ax.set_yticks([0, 500, 1000, 1500, 2000], ["0", "500ms", "1.0s", "1.5s", "2.0s"])
ax.tick_params(colors=SUBTEXT, labelsize=14, length=0, pad=10)
ax.grid(axis="y", color=SURFACE1, linewidth=1)
for s in ax.spines.values():
    s.set_visible(False)

fig.text(0.075, 0.9, "api  ·  p99 latency", color=TEXT, fontsize=24, fontweight="bold")
fig.text(0.075, 0.855, "retry backoff with jitter  ·  last 1 hour", color=OVERLAY, fontsize=15)
fig.text(0.97, 0.9, "1873ms peak", color=RED, fontsize=18, ha="right", fontweight="bold")

fig.savefig(sys.argv[1], dpi=100, facecolor=MANTLE)
