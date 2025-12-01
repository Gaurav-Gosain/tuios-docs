import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { useEffect, useState } from "react";
import { baseOptions } from "@/lib/layout.shared";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-semibold rounded-full bg-fd-primary/10 text-fd-primary border border-fd-primary/20 animate-fadeInUp">
            Terminal UI Operating System
          </div>

          <div
            className="mb-6 animate-fadeInUp stagger-1"
            style={{ opacity: 0 }}
          >
            <TuiosAsciiArt />
          </div>

          <p
            className="text-xl md:text-2xl text-fd-muted-foreground mb-8 leading-relaxed animate-fadeInUp stagger-2"
            style={{ opacity: 0 }}
          >
            A modern terminal window manager with vim-like controls.
            <br />
            Multiple workspaces. Tiling layouts. Scriptable automation.
          </p>

          {/* Demo GIF */}
          <div
            className="mb-8 rounded-lg overflow-hidden border-2 border-fd-border shadow-2xl max-w-3xl mx-auto demo-container animate-fadeInUp stagger-3"
            style={{ opacity: 0 }}
          >
            <img src="/demo.gif" alt="TUIOS Demo" className="w-full" />
          </div>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp stagger-4"
            style={{ opacity: 0 }}
          >
            <Link
              to="/docs/$"
              params={{ _splat: "getting-started" }}
              className="btn-primary px-6 py-3 rounded-lg bg-fd-primary text-fd-primary-foreground font-semibold text-base shadow-lg"
            >
              Get Started →
            </Link>
            <a
              href="https://github.com/Gaurav-Gosain/tuios"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-6 py-3 rounded-lg border-2 border-fd-border text-fd-foreground font-semibold text-base"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          <FeatureCard
            icon="terminal"
            title="Vim-Like Interface"
            description="Modal interface with Window Management and Terminal modes. 100+ customizable keybindings."
          />
          <FeatureCard
            icon="layout-grid"
            title="9 Workspaces"
            description="Organize windows across independent workspaces like virtual desktops."
          />
          <FeatureCard
            icon="layout-dashboard"
            title="Automatic Tiling"
            description="Grid-based layouts with master-stack tiling algorithm. Or manual snapping."
          />
          <FeatureCard
            icon="scroll-text"
            title="10K Line Scrollback"
            description="Navigate history with vim motions. Search, select, and copy text."
          />
          <FeatureCard
            icon="palette"
            title="300+ Themes"
            description="Built-in color themes: dracula, nord, tokyonight, and more."
          />
          <FeatureCard
            icon="file-code"
            title="Tape Scripting"
            description="Automate workflows with a simple DSL. Record and replay interactions."
          />
        </div>

        {/* Quick Example */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Quick Start</h2>
          <div className="rounded-xl border-2 border-fd-border bg-fd-card p-6 md:p-8 shadow-xl">
            <div className="space-y-4">
              <TerminalBlock command="brew install tuios">
                <span className="text-fd-muted-foreground">
                  # Install with Homebrew
                </span>
                {"\n"}
                <span style={{ color: "hsl(var(--primary))" }}>brew</span>
                {" install "}
                <span
                  className="tuios-glow font-bold"
                  style={{ color: "#bb9af7" }}
                >
                  tuios
                </span>
              </TerminalBlock>
              <TerminalBlock command="tuios">
                <span className="text-fd-muted-foreground"># Launch TUIOS</span>
                {"\n"}
                <span
                  className="tuios-glow font-bold"
                  style={{ color: "#bb9af7" }}
                >
                  tuios
                </span>
              </TerminalBlock>
              <div className="pt-4 border-t border-fd-border">
                <p className="text-sm text-fd-muted-foreground mb-2">
                  Essential keys:
                </p>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <kbd>n</kbd>
                    <span className="text-fd-muted-foreground">
                      → Create new window
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd>i</kbd>
                    <span className="text-fd-muted-foreground">
                      → Enter terminal mode
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd>Ctrl</kbd>+<kbd>B</kbd>+<kbd>?</kbd>
                    <span className="text-fd-muted-foreground">
                      → Show help
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd>t</kbd>
                    <span className="text-fd-muted-foreground">
                      → Toggle tiling
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap gap-6 justify-center text-sm text-fd-muted-foreground">
            <Stat label="MIT License" />
            <Stat label="Open Source" />
            <Stat label="Cross Platform" />
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  // Dynamically import lucide-static icons
  const iconMap: Record<string, string> = {
    terminal:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>',
    "layout-grid":
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',
    "layout-dashboard":
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
    "scroll-text":
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M15 8h-5"/><path d="M15 12h-5"/></svg>',
    palette:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
    "file-code":
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/></svg>',
  };

  return (
    <div className="feature-card rounded-lg border border-fd-border bg-fd-card p-6 hover:border-fd-primary/50 transition-all">
      <div
        className="text-fd-primary mb-3 w-6 h-6"
        dangerouslySetInnerHTML={{ __html: iconMap[icon] || "" }}
      />
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-fd-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-fd-background rounded-lg p-4 font-mono text-sm overflow-x-auto border border-fd-border">
      <code>{children}</code>
    </pre>
  );
}

function KeyCombo({
  keys,
  description,
}: {
  keys: string[];
  description: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="px-2 py-1 text-xs font-mono rounded bg-fd-accent border border-fd-border"
          >
            {key}
          </kbd>
        ))}
      </div>
      <span className="text-fd-muted-foreground">→ {description}</span>
    </div>
  );
}

function Stat({ label }: { label: string }) {
  return <span className="font-mono">{label}</span>;
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

  // Calculate height based on line count (10 lines now with border and padding)
  const lineHeight = 1.2;
  const fontSize = 0.75; // rem
  const lines = 10;
  const heightInRem = lines * fontSize * lineHeight;

  // Calculate column index for staggered animation
  const getColumnDelay = (idx: number) => {
    const lines = fullArt.split("\n");
    let charCount = 0;
    let colIdx = 0;

    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= idx) {
        colIdx = idx - charCount;
        break;
      }
      charCount += lines[i].length + 1; // +1 for newline
    }

    // Add stagger based on column position (40ms per column for visible wave effect)
    return colIdx * 40;
  };

  return (
    <div
      className="inline-block text-left"
      style={{ minHeight: `${heightInRem}rem` }}
    >
      <pre
        style={{
          fontFamily:
            'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace',
          fontSize: "0.75rem",
          lineHeight: "1.2",
          margin: 0,
          padding: 0,
          whiteSpace: "pre",
          position: "relative",
        }}
      >
        {fullArt.split("").map((char, idx) => {
          if (char === "\n") {
            return <br key={idx} />;
          }
          // Check if character is part of the border
          const isBorder =
            char === "╭" ||
            char === "─" ||
            char === "╮" ||
            char === "│" ||
            char === "╰" ||
            char === "╯";
          const color = isBorder ? "#7aa2f7" : "#bb9af7";
          const shadow = isBorder
            ? "0 0 2px rgba(122, 162, 247, 0.5)"
            : "0 0 2px rgba(187, 154, 247, 0.5)";

          return (
            <span
              key={idx}
              className={started ? "char-animate" : ""}
              style={{
                color: color,
                textShadow: shadow,
                animationDelay: `${getColumnDelay(idx)}ms`,
                opacity: started ? undefined : 0,
              }}
            >
              {char}
            </span>
          );
        })}
      </pre>
    </div>
  );
}

function TerminalBlock({
  command,
  children,
}: {
  command: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group bg-fd-muted/50 backdrop-blur rounded-lg border border-fd-border/50 hover:border-fd-primary/30 transition-all overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-fd-border/50 bg-fd-muted/30">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <span className="text-xs text-fd-muted-foreground ml-2">bash</span>
      </div>
      {/* Terminal content */}
      <div className="relative">
        <pre className="p-4 overflow-x-auto">
          <code className="font-mono text-sm">{children}</code>
        </pre>
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 rounded-md bg-fd-accent/50 border border-fd-border/50 hover:bg-fd-accent hover:border-fd-primary/50 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Copy command"
        >
          {copied ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-500"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-fd-muted-foreground"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
