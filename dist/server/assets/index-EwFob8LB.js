import { jsx, jsxs } from 'react/jsx-runtime';
import { Link } from '@tanstack/react-router';
import { H as HomeLayout } from './router-yBWKifsJ.js';
import { useState, useEffect } from 'react';
import { b as baseOptions } from './layout.shared-Zw_RDWoL.js';
import 'tailwind-merge';
import 'class-variance-authority';
import './source-z941Y2wC.js';
import 'fumadocs-mdx/runtime/browser';
import '@radix-ui/react-popover';
import 'next-themes';
import '@radix-ui/react-collapsible';
import 'scroll-into-view-if-needed';
import '@radix-ui/react-scroll-area';
import '@radix-ui/react-presence';
import '@radix-ui/react-tabs';
import 'fumadocs-mdx/runtime/server';
import 'lucide-static';
import '@radix-ui/react-navigation-menu';
import '@radix-ui/react-direction';
import 'feed';
import '../server.js';
import '@tanstack/history';
import '@tanstack/router-core/ssr/client';
import '@tanstack/router-core';
import 'node:async_hooks';
import '@tanstack/router-core/ssr/server';
import 'h3-v2';
import 'tiny-invariant';
import 'seroval';
import '@tanstack/react-router/ssr/server';
import '@orama/orama';

function Home() {
  return /* @__PURE__ */ jsx(HomeLayout, { ...baseOptions(), children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-16 md:py-24", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center max-w-4xl mx-auto mb-16", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-block px-3 py-1 mb-6 text-xs font-semibold rounded-full bg-fd-primary/10 text-fd-primary border border-fd-primary/20 animate-fadeInUp", children: "Terminal UI Operating System" }),
      /* @__PURE__ */ jsx("div", { className: "mb-6 animate-fadeInUp stagger-1", style: {
        opacity: 0
      }, children: /* @__PURE__ */ jsx(TuiosAsciiArt, {}) }),
      /* @__PURE__ */ jsxs("p", { className: "text-xl md:text-2xl text-fd-muted-foreground mb-8 leading-relaxed animate-fadeInUp stagger-2", style: {
        opacity: 0
      }, children: [
        "A modern terminal window manager with vim-like controls.",
        /* @__PURE__ */ jsx("br", {}),
        "Multiple workspaces. Tiling layouts. Scriptable automation."
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mb-8 rounded-lg overflow-hidden border-2 border-fd-border shadow-2xl max-w-3xl mx-auto demo-container animate-fadeInUp stagger-3", style: {
        opacity: 0
      }, children: /* @__PURE__ */ jsx("img", { src: "/demo.gif", alt: "TUIOS Demo", className: "w-full" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp stagger-4", style: {
        opacity: 0
      }, children: [
        /* @__PURE__ */ jsx(Link, { to: "/docs/$", params: {
          _splat: "getting-started"
        }, className: "btn-primary px-6 py-3 rounded-lg bg-fd-primary text-fd-primary-foreground font-semibold text-base shadow-lg", children: "Get Started →" }),
        /* @__PURE__ */ jsx("a", { href: "https://github.com/Gaurav-Gosain/tuios", target: "_blank", rel: "noopener noreferrer", className: "btn-secondary px-6 py-3 rounded-lg border-2 border-fd-border text-fd-foreground font-semibold text-base", children: "View on GitHub" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16", children: [
      /* @__PURE__ */ jsx(FeatureCard, { icon: "terminal", title: "Vim-Like Interface", description: "Modal interface with Window Management and Terminal modes. 100+ customizable keybindings." }),
      /* @__PURE__ */ jsx(FeatureCard, { icon: "layout-grid", title: "9 Workspaces", description: "Organize windows across independent workspaces like virtual desktops." }),
      /* @__PURE__ */ jsx(FeatureCard, { icon: "layout-dashboard", title: "Automatic Tiling", description: "Grid-based layouts with master-stack tiling algorithm. Or manual snapping." }),
      /* @__PURE__ */ jsx(FeatureCard, { icon: "scroll-text", title: "10K Line Scrollback", description: "Navigate history with vim motions. Search, select, and copy text." }),
      /* @__PURE__ */ jsx(FeatureCard, { icon: "palette", title: "300+ Themes", description: "Built-in color themes: dracula, nord, tokyonight, and more." }),
      /* @__PURE__ */ jsx(FeatureCard, { icon: "file-code", title: "Tape Scripting", description: "Automate workflows with a simple DSL. Record and replay interactions." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-center mb-8", children: "Quick Start" }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl border-2 border-fd-border bg-fd-card p-6 md:p-8 shadow-xl", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs(TerminalBlock, { command: "brew install tuios", children: [
          /* @__PURE__ */ jsx("span", { className: "text-fd-muted-foreground", children: "# Install with Homebrew" }),
          "\n",
          /* @__PURE__ */ jsx("span", { style: {
            color: "hsl(var(--primary))"
          }, children: "brew" }),
          " install ",
          /* @__PURE__ */ jsx("span", { className: "tuios-glow font-bold", style: {
            color: "#bb9af7"
          }, children: "tuios" })
        ] }),
        /* @__PURE__ */ jsxs(TerminalBlock, { command: "tuios", children: [
          /* @__PURE__ */ jsx("span", { className: "text-fd-muted-foreground", children: "# Launch TUIOS" }),
          "\n",
          /* @__PURE__ */ jsx("span", { className: "tuios-glow font-bold", style: {
            color: "#bb9af7"
          }, children: "tuios" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-fd-border", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-fd-muted-foreground mb-2", children: "Essential keys:" }),
          /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-2 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("kbd", { children: "n" }),
              /* @__PURE__ */ jsx("span", { className: "text-fd-muted-foreground", children: "→ Create new window" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("kbd", { children: "i" }),
              /* @__PURE__ */ jsx("span", { className: "text-fd-muted-foreground", children: "→ Enter terminal mode" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("kbd", { children: "Ctrl" }),
              "+",
              /* @__PURE__ */ jsx("kbd", { children: "B" }),
              "+",
              /* @__PURE__ */ jsx("kbd", { children: "?" }),
              /* @__PURE__ */ jsx("span", { className: "text-fd-muted-foreground", children: "→ Show help" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("kbd", { children: "t" }),
              /* @__PURE__ */ jsx("span", { className: "text-fd-muted-foreground", children: "→ Toggle tiling" })
            ] })
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-16 text-center", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex flex-wrap gap-6 justify-center text-sm text-fd-muted-foreground", children: [
      /* @__PURE__ */ jsx(Stat, { label: "MIT License" }),
      /* @__PURE__ */ jsx(Stat, { label: "Open Source" }),
      /* @__PURE__ */ jsx(Stat, { label: "Cross Platform" })
    ] }) })
  ] }) });
}
function FeatureCard({
  icon,
  title,
  description
}) {
  const iconMap = {
    terminal: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>',
    "layout-grid": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',
    "layout-dashboard": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
    "scroll-text": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M15 8h-5"/><path d="M15 12h-5"/></svg>',
    palette: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
    "file-code": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/></svg>'
  };
  return /* @__PURE__ */ jsxs("div", { className: "feature-card rounded-lg border border-fd-border bg-fd-card p-6 hover:border-fd-primary/50 transition-all", children: [
    /* @__PURE__ */ jsx("div", { className: "text-fd-primary mb-3 w-6 h-6", dangerouslySetInnerHTML: {
      __html: iconMap[icon] || ""
    } }),
    /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg mb-2", children: title }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-fd-muted-foreground leading-relaxed", children: description })
  ] });
}
function Stat({
  label
}) {
  return /* @__PURE__ */ jsx("span", { className: "font-mono", children: label });
}
function TuiosAsciiArt() {
  const [started, setStarted] = useState(false);
  const fullArt = `╭─────────────────────────────────────────────────╮
│                                                 │
│     ████████╗██╗   ██╗██╗ ██████╗ ███████╗      │
│     ╚══██╔══╝██║   ██║██║██╔═══██╗██╔════╝      │
│        ██║   ██║   ██║██║██║   ██║███████╗      │
│        ██║   ██║   ██║██║██║   ██║╚════██║      │
│        ██║   ╚██████╔╝██║╚██████╔╝███████║      │
│        ╚═╝    ╚═════╝ ╚═╝ ╚═════╝ ╚══════╝      │
│                                                 │
╰─────────────────────────────────────────────────╯`;
  useEffect(() => {
    setStarted(true);
  }, []);
  const lineHeight = 1.2;
  const fontSize = 0.75;
  const lines = 10;
  const heightInRem = lines * fontSize * lineHeight;
  const getColumnDelay = (idx) => {
    const lines2 = fullArt.split("\n");
    let charCount = 0;
    let colIdx = 0;
    for (let i = 0; i < lines2.length; i++) {
      if (charCount + lines2[i].length >= idx) {
        colIdx = idx - charCount;
        break;
      }
      charCount += lines2[i].length + 1;
    }
    return colIdx * 40;
  };
  return /* @__PURE__ */ jsx("div", { className: "inline-block text-left", style: {
    minHeight: `${heightInRem}rem`
  }, children: /* @__PURE__ */ jsx("pre", { style: {
    fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace',
    fontSize: "0.75rem",
    lineHeight: "1.2",
    margin: 0,
    padding: 0,
    whiteSpace: "pre",
    position: "relative"
  }, children: fullArt.split("").map((char, idx) => {
    if (char === "\n") {
      return /* @__PURE__ */ jsx("br", {}, idx);
    }
    const isBorder = char === "╭" || char === "─" || char === "╮" || char === "│" || char === "╰" || char === "╯";
    const color = isBorder ? "#7aa2f7" : "#bb9af7";
    const shadow = isBorder ? "0 0 2px rgba(122, 162, 247, 0.5)" : "0 0 2px rgba(187, 154, 247, 0.5)";
    return /* @__PURE__ */ jsx("span", { className: started ? "char-animate" : "", style: {
      color,
      textShadow: shadow,
      animationDelay: `${getColumnDelay(idx)}ms`,
      opacity: started ? void 0 : 0
    }, children: char }, idx);
  }) }) });
}
function TerminalBlock({
  command,
  children
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative group bg-fd-muted/50 backdrop-blur rounded-lg border border-fd-border/50 hover:border-fd-primary/30 transition-all overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-4 py-2 border-b border-fd-border/50 bg-fd-muted/30", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
        /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-red-500/80" }),
        /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-500/80" }),
        /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-green-500/80" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-fd-muted-foreground ml-2", children: "bash" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx("pre", { className: "p-4 overflow-x-auto", children: /* @__PURE__ */ jsx("code", { className: "font-mono text-sm", children }) }),
      /* @__PURE__ */ jsx("button", { onClick: handleCopy, className: "absolute top-2 right-2 p-2 rounded-md bg-fd-accent/50 border border-fd-border/50 hover:bg-fd-accent hover:border-fd-primary/50 transition-all opacity-0 group-hover:opacity-100", "aria-label": "Copy command", children: copied ? /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-green-500", children: /* @__PURE__ */ jsx("polyline", { points: "20 6 9 17 4 12" }) }) : /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-fd-muted-foreground", children: [
        /* @__PURE__ */ jsx("rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }),
        /* @__PURE__ */ jsx("path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" })
      ] }) })
    ] })
  ] });
}

export { Home as component };
