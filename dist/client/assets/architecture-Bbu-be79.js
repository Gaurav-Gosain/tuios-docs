import{j as e}from"./main-PoOGVlt9.js";let c={title:"Architecture",description:"Technical architecture and design of TUIOS",icon:"Boxes"},d={contents:[{heading:void 0,content:"TUIOS is built on the Bubble Tea v2 framework following the Model-View-Update (MVU) pattern."},{heading:"tech-stack",content:"Bubble Tea v2 - Event-driven TUI framework"},{heading:"tech-stack",content:"Lipgloss v2 - Terminal styling with caching"},{heading:"tech-stack",content:"go-pty - Cross-platform PTY interface"},{heading:"tech-stack",content:"Wish v2 - SSH server framework"},{heading:"tech-stack",content:"Cobra - CLI framework"},{heading:"tech-stack",content:"Vendored VT emulator - Custom ANSI/VT100 terminal emulator"},{heading:"window-manager-apposgo",content:"The central OS struct manages:"},{heading:"window-manager-apposgo",content:"Window lifecycle (create, focus, close)"},{heading:"window-manager-apposgo",content:"9 workspaces with independent layouts"},{heading:"window-manager-apposgo",content:"Tiling mode with master-stack algorithm"},{heading:"window-manager-apposgo",content:"Mouse interaction state (dragging, resizing)"},{heading:"window-manager-apposgo",content:"Keybind registry for customization"},{heading:"terminal-emulation-vt",content:"Custom ANSI/VT100 emulator:"},{heading:"terminal-emulation-vt",content:"Full CSI, OSC, ESC sequence support"},{heading:"terminal-emulation-vt",content:"10,000 line scrollback buffer"},{heading:"terminal-emulation-vt",content:"Bidirectional Unicode support"},{heading:"terminal-emulation-vt",content:"SGR (color/style) attribute handling"},{heading:"terminal-emulation-vt",content:"Alternative screen buffer (for vim, less, etc.)"},{heading:"rendering-engine-apprendergo",content:"Layer-based composition:"},{heading:"rendering-engine-apprendergo",content:"Window layers - Terminal content with borders"},{heading:"rendering-engine-apprendergo",content:"Overlay layers - Help, logs, cache stats"},{heading:"rendering-engine-apprendergo",content:"Dockbar - Window list and workspace indicator"},{heading:"rendering-engine-apprendergo",content:"Mouse cursor - Selection and interaction feedback"},{heading:"rendering-engine-apprendergo",content:"Optimizations:"},{heading:"rendering-engine-apprendergo",content:"Viewport culling (skip off-screen windows)"},{heading:"rendering-engine-apprendergo",content:"Style caching with LRU eviction"},{heading:"rendering-engine-apprendergo",content:"Adaptive refresh rates (60Hz focused, 30Hz background)"},{heading:"rendering-engine-apprendergo",content:"Frame skipping when no changes detected"},{heading:"input-system-input",content:"Modal routing:"},{heading:"input-system-input",content:"Window Management Mode - Navigate, create, tile"},{heading:"input-system-input",content:"Terminal Mode - Input forwarded to PTY"},{heading:"input-system-input",content:"Copy Mode - Vim-style scrollback navigation"},{heading:"input-system-input",content:"Prefix Mode - Tmux-style leader key commands"},{heading:"input-system-input",content:"100+ configurable keybindings across modes."},{heading:"configuration-config",content:"TOML-based configuration:"},{heading:"configuration-config",content:"Keybinding customization per section"},{heading:"configuration-config",content:"Appearance options (borders, dockbar, scrollback)"},{heading:"configuration-config",content:"Platform-specific defaults (macOS Option key)"},{heading:"configuration-config",content:"Validation and auto-migration"},{heading:"style-caching",content:"Two-tier caching strategy:"},{heading:"style-caching",content:"Full render cache - Complete styled output (hash-based lookup)"},{heading:"style-caching",content:"Optimized render cache - Partial updates for minor changes"},{heading:"style-caching",content:"Benefits:"},{heading:"style-caching",content:"40-60% allocation reduction"},{heading:"style-caching",content:"LRU eviction (configurable size)"},{heading:"style-caching",content:"Automatic invalidation on content changes"},{heading:"style-caching",content:"See cache stats with Ctrl+B D c."},{heading:"viewport-culling",content:"Only render visible windows:"},{heading:"viewport-culling",content:"Off-screen windows skipped"},{heading:"viewport-culling",content:"Minimized windows excluded"},{heading:"viewport-culling",content:"Significant CPU savings with many windows"},{heading:"adaptive-refresh",content:"60 FPS - Focused window in terminal mode"},{heading:"adaptive-refresh",content:"30 FPS - Background windows"},{heading:"adaptive-refresh",content:"Frame skipping - When no changes detected"},{heading:"memory-pooling",content:"Reusable buffers for:"},{heading:"memory-pooling",content:"String builders"},{heading:"memory-pooling",content:"Style objects"},{heading:"memory-pooling",content:"Screen buffers"},{heading:"ssh-server-architecture",content:"Built on Wish v2 (SSH framework):"},{heading:"ssh-server-architecture",content:"Per-connection isolation:"},{heading:"ssh-server-architecture",content:"Each SSH session gets its own OS instance"},{heading:"ssh-server-architecture",content:"Independent workspace and window state"},{heading:"ssh-server-architecture",content:"No shared memory between sessions"},{heading:"ssh-server-architecture",content:"Security:"},{heading:"ssh-server-architecture",content:"Auto-generated host keys"},{heading:"ssh-server-architecture",content:"Public key authentication support"},{heading:"ssh-server-architecture",content:"No password auth by default"},{heading:"ssh-server-architecture",content:"Usage:"},{heading:"tape-scripting-system",content:"Domain-specific language for automation:"},{heading:"tape-scripting-system",content:"Pipeline:"},{heading:"tape-scripting-system",content:"Lexer (tape/lexer.go) - Tokenization"},{heading:"tape-scripting-system",content:"Parser (tape/parser.go) - AST generation"},{heading:"tape-scripting-system",content:"Executor (tape/executor.go) - Command execution"},{heading:"tape-scripting-system",content:"Player (tape/player.go) - Playback engine with timing"},{heading:"tape-scripting-system",content:"Commands:"},{heading:"tape-scripting-system",content:"Mode switching (WindowManagementMode, TerminalMode)"},{heading:"tape-scripting-system",content:"Window operations (NewWindow, CloseWindow, RenameWindow)"},{heading:"tape-scripting-system",content:"Workspace management (SwitchWorkspace, MoveToWorkspace)"},{heading:"tape-scripting-system",content:"Keyboard input (Type, Enter, Ctrl+X combinations)"},{heading:"tape-scripting-system",content:"Timing (Sleep, WaitUntilRegex)"},{heading:"theme-system",content:"300+ built-in themes using bubbletint:"},{heading:"theme-system",content:"ANSI 16-color palette mapping"},{heading:"theme-system",content:"SGR sequence translation"},{heading:"theme-system",content:"Runtime theme switching"},{heading:"theme-system",content:"Terminal color profile detection"},{heading:"theme-system",content:"Usage:"},{heading:"bubble-tea-mvu",content:"Model - app.OS struct holds all state"},{heading:"bubble-tea-mvu",content:"View - render.go generates terminal output"},{heading:"bubble-tea-mvu",content:"Update - update.go handles messages:"},{heading:"bubble-tea-mvu",content:"tea.KeyMsg - Keyboard input"},{heading:"bubble-tea-mvu",content:"tea.MouseMsg - Mouse events"},{heading:"bubble-tea-mvu",content:"tea.WindowSizeMsg - Terminal resize"},{heading:"bubble-tea-mvu",content:"Custom messages (window exit, PTY output)"},{heading:"message-flow",content:"Flow Explanation:"},{heading:"message-flow",content:"User Input - Keyboard or mouse event occurs"},{heading:"message-flow",content:"Bubble Tea - Event system captures input"},{heading:"message-flow",content:"input.HandleInput() - Central router receives event"},{heading:"message-flow",content:"Modal Router - Determines mode and routes to handler"},{heading:"message-flow",content:"OS.Update() - Handler modifies application state"},{heading:"message-flow",content:"Render - Screen updates based on new state"},{heading:"window-lifecycle",content:"Lifecycle Stages:"},{heading:"window-lifecycle",content:"Creation - PTY spawned, shell launched"},{heading:"window-lifecycle",content:"Monitor - Background goroutine reads output"},{heading:"window-lifecycle",content:"Update - Terminal emulator processes ANSI sequences"},{heading:"window-lifecycle",content:"Render - Screen displays content"},{heading:"window-lifecycle",content:"Cleanup - On exit, PTY closed, resources freed"},{heading:"testing",content:"Test coverage:"},{heading:"testing",content:"Configuration validation"},{heading:"testing",content:"Tape parsing and execution"},{heading:"testing",content:"VT emulator sequences"},{heading:"testing",content:"Style cache behavior"},{heading:"building-from-source",content:"Requirements:"},{heading:"building-from-source",content:"Go 1.24+"},{heading:"building-from-source",content:"C compiler (for PTY support)"},{heading:"building-from-source",content:"Nerd Font (for icons)"},{heading:"cross-platform-support",content:"PTY implementation:"},{heading:"cross-platform-support",content:"Unix: terminal/pty_unix.go (uses creack/pty)"},{heading:"cross-platform-support",content:"Windows: terminal/pty_windows.go (uses ConPTY)"},{heading:"cross-platform-support",content:"Window sizing:"},{heading:"cross-platform-support",content:"Unix: terminal/window_unix.go (TIOCGWINSZ ioctl)"},{heading:"cross-platform-support",content:"Windows: terminal/window_windows.go (Windows Console API)"},{heading:"cross-platform-support",content:"System info:"},{heading:"cross-platform-support",content:"macOS: system/sysinfo_darwin.go (sysctl)"},{heading:"cross-platform-support",content:"Linux: system/sysinfo_linux.go (/proc, cgroups)"},{heading:"contributing",content:"See CONTRIBUTING.md in the main repository."}],headings:[{id:"tech-stack",content:"Tech Stack"},{id:"core-components",content:"Core Components"},{id:"window-manager-apposgo",content:"Window Manager (app/os.go)"},{id:"terminal-emulation-vt",content:"Terminal Emulation (vt/)"},{id:"rendering-engine-apprendergo",content:"Rendering Engine (app/render.go)"},{id:"input-system-input",content:"Input System (input/)"},{id:"configuration-config",content:"Configuration (config/)"},{id:"performance-optimizations",content:"Performance Optimizations"},{id:"style-caching",content:"Style Caching"},{id:"viewport-culling",content:"Viewport Culling"},{id:"adaptive-refresh",content:"Adaptive Refresh"},{id:"memory-pooling",content:"Memory Pooling"},{id:"ssh-server-architecture",content:"SSH Server Architecture"},{id:"tape-scripting-system",content:"Tape Scripting System"},{id:"theme-system",content:"Theme System"},{id:"development-patterns",content:"Development Patterns"},{id:"bubble-tea-mvu",content:"Bubble Tea MVU"},{id:"message-flow",content:"Message Flow"},{id:"window-lifecycle",content:"Window Lifecycle"},{id:"testing",content:"Testing"},{id:"building-from-source",content:"Building from Source"},{id:"cross-platform-support",content:"Cross-Platform Support"},{id:"contributing",content:"Contributing"},{id:"related-documentation",content:"Related Documentation"}]};const h=[{depth:2,url:"#tech-stack",title:e.jsx(e.Fragment,{children:"Tech Stack"})},{depth:2,url:"#core-components",title:e.jsx(e.Fragment,{children:"Core Components"})},{depth:3,url:"#window-manager-apposgo",title:e.jsx(e.Fragment,{children:"Window Manager (app/os.go)"})},{depth:3,url:"#terminal-emulation-vt",title:e.jsx(e.Fragment,{children:"Terminal Emulation (vt/)"})},{depth:3,url:"#rendering-engine-apprendergo",title:e.jsx(e.Fragment,{children:"Rendering Engine (app/render.go)"})},{depth:3,url:"#input-system-input",title:e.jsx(e.Fragment,{children:"Input System (input/)"})},{depth:3,url:"#configuration-config",title:e.jsx(e.Fragment,{children:"Configuration (config/)"})},{depth:2,url:"#performance-optimizations",title:e.jsx(e.Fragment,{children:"Performance Optimizations"})},{depth:3,url:"#style-caching",title:e.jsx(e.Fragment,{children:"Style Caching"})},{depth:3,url:"#viewport-culling",title:e.jsx(e.Fragment,{children:"Viewport Culling"})},{depth:3,url:"#adaptive-refresh",title:e.jsx(e.Fragment,{children:"Adaptive Refresh"})},{depth:3,url:"#memory-pooling",title:e.jsx(e.Fragment,{children:"Memory Pooling"})},{depth:2,url:"#ssh-server-architecture",title:e.jsx(e.Fragment,{children:"SSH Server Architecture"})},{depth:2,url:"#tape-scripting-system",title:e.jsx(e.Fragment,{children:"Tape Scripting System"})},{depth:2,url:"#theme-system",title:e.jsx(e.Fragment,{children:"Theme System"})},{depth:2,url:"#development-patterns",title:e.jsx(e.Fragment,{children:"Development Patterns"})},{depth:3,url:"#bubble-tea-mvu",title:e.jsx(e.Fragment,{children:"Bubble Tea MVU"})},{depth:3,url:"#message-flow",title:e.jsx(e.Fragment,{children:"Message Flow"})},{depth:3,url:"#window-lifecycle",title:e.jsx(e.Fragment,{children:"Window Lifecycle"})},{depth:2,url:"#testing",title:e.jsx(e.Fragment,{children:"Testing"})},{depth:2,url:"#building-from-source",title:e.jsx(e.Fragment,{children:"Building from Source"})},{depth:2,url:"#cross-platform-support",title:e.jsx(e.Fragment,{children:"Cross-Platform Support"})},{depth:2,url:"#contributing",title:e.jsx(e.Fragment,{children:"Contributing"})},{depth:2,url:"#related-documentation",title:e.jsx(e.Fragment,{children:"Related Documentation"})}];function l(i){const n={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components},{Card:t,Cards:o,Mermaid:s}=n;return t||r("Card"),o||r("Cards"),s||r("Mermaid"),e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:"TUIOS is built on the Bubble Tea v2 framework following the Model-View-Update (MVU) pattern."}),`
`,e.jsx(n.h2,{id:"tech-stack",children:"Tech Stack"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.a,{href:"https://github.com/charmbracelet/bubbletea",children:"Bubble Tea v2"})})," - Event-driven TUI framework"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.a,{href:"https://github.com/charmbracelet/lipgloss",children:"Lipgloss v2"})})," - Terminal styling with caching"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.a,{href:"https://github.com/aymanbagabas/go-pty",children:"go-pty"})})," - Cross-platform PTY interface"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.a,{href:"https://github.com/charmbracelet/wish",children:"Wish v2"})})," - SSH server framework"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.a,{href:"https://github.com/spf13/cobra",children:"Cobra"})})," - CLI framework"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Vendored VT emulator"})," - Custom ANSI/VT100 terminal emulator"]}),`
`]}),`
`,e.jsx(n.h2,{id:"core-components",children:"Core Components"}),`
`,e.jsx(n.h3,{id:"window-manager-apposgo",children:"Window Manager (app/os.go)"}),`
`,e.jsxs(n.p,{children:["The central ",e.jsx(n.code,{children:"OS"})," struct manages:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Window lifecycle (create, focus, close)"}),`
`,e.jsx(n.li,{children:"9 workspaces with independent layouts"}),`
`,e.jsx(n.li,{children:"Tiling mode with master-stack algorithm"}),`
`,e.jsx(n.li,{children:"Mouse interaction state (dragging, resizing)"}),`
`,e.jsx(n.li,{children:"Keybind registry for customization"}),`
`]}),`
`,e.jsx(n.h3,{id:"terminal-emulation-vt",children:"Terminal Emulation (vt/)"}),`
`,e.jsx(n.p,{children:"Custom ANSI/VT100 emulator:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Full CSI, OSC, ESC sequence support"}),`
`,e.jsx(n.li,{children:"10,000 line scrollback buffer"}),`
`,e.jsx(n.li,{children:"Bidirectional Unicode support"}),`
`,e.jsx(n.li,{children:"SGR (color/style) attribute handling"}),`
`,e.jsx(n.li,{children:"Alternative screen buffer (for vim, less, etc.)"}),`
`]}),`
`,e.jsx(n.h3,{id:"rendering-engine-apprendergo",children:"Rendering Engine (app/render.go)"}),`
`,e.jsx(n.p,{children:"Layer-based composition:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Window layers"})," - Terminal content with borders"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Overlay layers"})," - Help, logs, cache stats"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Dockbar"})," - Window list and workspace indicator"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Mouse cursor"})," - Selection and interaction feedback"]}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Optimizations:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Viewport culling (skip off-screen windows)"}),`
`,e.jsx(n.li,{children:"Style caching with LRU eviction"}),`
`,e.jsx(n.li,{children:"Adaptive refresh rates (60Hz focused, 30Hz background)"}),`
`,e.jsx(n.li,{children:"Frame skipping when no changes detected"}),`
`]}),`
`,e.jsx(n.h3,{id:"input-system-input",children:"Input System (input/)"}),`
`,e.jsx(n.p,{children:"Modal routing:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Window Management Mode"})," - Navigate, create, tile"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Terminal Mode"})," - Input forwarded to PTY"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Copy Mode"})," - Vim-style scrollback navigation"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Prefix Mode"})," - Tmux-style leader key commands"]}),`
`]}),`
`,e.jsx(n.p,{children:"100+ configurable keybindings across modes."}),`
`,e.jsx(n.h3,{id:"configuration-config",children:"Configuration (config/)"}),`
`,e.jsx(n.p,{children:"TOML-based configuration:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Keybinding customization per section"}),`
`,e.jsx(n.li,{children:"Appearance options (borders, dockbar, scrollback)"}),`
`,e.jsx(n.li,{children:"Platform-specific defaults (macOS Option key)"}),`
`,e.jsx(n.li,{children:"Validation and auto-migration"}),`
`]}),`
`,e.jsx(n.h2,{id:"performance-optimizations",children:"Performance Optimizations"}),`
`,e.jsx(n.h3,{id:"style-caching",children:"Style Caching"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Two-tier caching strategy:"})}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Full render cache"})," - Complete styled output (hash-based lookup)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Optimized render cache"})," - Partial updates for minor changes"]}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Benefits:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"40-60% allocation reduction"}),`
`,e.jsx(n.li,{children:"LRU eviction (configurable size)"}),`
`,e.jsx(n.li,{children:"Automatic invalidation on content changes"}),`
`]}),`
`,e.jsxs(n.p,{children:["See cache stats with ",e.jsx(n.code,{children:"Ctrl+B D c"}),"."]}),`
`,e.jsx(n.h3,{id:"viewport-culling",children:"Viewport Culling"}),`
`,e.jsx(n.p,{children:"Only render visible windows:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Off-screen windows skipped"}),`
`,e.jsx(n.li,{children:"Minimized windows excluded"}),`
`,e.jsx(n.li,{children:"Significant CPU savings with many windows"}),`
`]}),`
`,e.jsx(n.h3,{id:"adaptive-refresh",children:"Adaptive Refresh"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"60 FPS"})," - Focused window in terminal mode"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"30 FPS"})," - Background windows"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Frame skipping"})," - When no changes detected"]}),`
`]}),`
`,e.jsx(n.h3,{id:"memory-pooling",children:"Memory Pooling"}),`
`,e.jsx(n.p,{children:"Reusable buffers for:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"String builders"}),`
`,e.jsx(n.li,{children:"Style objects"}),`
`,e.jsx(n.li,{children:"Screen buffers"}),`
`]}),`
`,e.jsx(n.h2,{id:"ssh-server-architecture",children:"SSH Server Architecture"}),`
`,e.jsx(n.p,{children:"Built on Wish v2 (SSH framework):"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Per-connection isolation:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Each SSH session gets its own OS instance"}),`
`,e.jsx(n.li,{children:"Independent workspace and window state"}),`
`,e.jsx(n.li,{children:"No shared memory between sessions"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Security:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Auto-generated host keys"}),`
`,e.jsx(n.li,{children:"Public key authentication support"}),`
`,e.jsx(n.li,{children:"No password auth by default"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Usage:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"tuios"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ssh"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --host"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0.0.0"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --port"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 2222"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ssh"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -p"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 2222"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" user@hostname"})]})]})})}),`
`,e.jsx(n.h2,{id:"tape-scripting-system",children:"Tape Scripting System"}),`
`,e.jsx(n.p,{children:"Domain-specific language for automation:"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Pipeline:"})}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Lexer"})," (tape/lexer.go) - Tokenization"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Parser"})," (tape/parser.go) - AST generation"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Executor"})," (tape/executor.go) - Command execution"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Player"})," (tape/player.go) - Playback engine with timing"]}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Commands:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Mode switching (WindowManagementMode, TerminalMode)"}),`
`,e.jsx(n.li,{children:"Window operations (NewWindow, CloseWindow, RenameWindow)"}),`
`,e.jsx(n.li,{children:"Workspace management (SwitchWorkspace, MoveToWorkspace)"}),`
`,e.jsx(n.li,{children:"Keyboard input (Type, Enter, Ctrl+X combinations)"}),`
`,e.jsx(n.li,{children:"Timing (Sleep, WaitUntilRegex)"}),`
`]}),`
`,e.jsx(n.h2,{id:"theme-system",children:"Theme System"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"300+ built-in themes"})," using ",e.jsx(n.a,{href:"https://github.com/lrstanley/bubbletint",children:"bubbletint"}),":"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"ANSI 16-color palette mapping"}),`
`,e.jsx(n.li,{children:"SGR sequence translation"}),`
`,e.jsx(n.li,{children:"Runtime theme switching"}),`
`,e.jsx(n.li,{children:"Terminal color profile detection"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Usage:"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"tuios"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --theme"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dracula"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"tuios"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --list-themes"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"tuios"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --preview-theme"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" nord"})]})]})})}),`
`,e.jsx(n.h2,{id:"development-patterns",children:"Development Patterns"}),`
`,e.jsx(n.h3,{id:"bubble-tea-mvu",children:"Bubble Tea MVU"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Model"})," - ",e.jsx(n.code,{children:"app.OS"})," struct holds all state"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"View"})," - ",e.jsx(n.code,{children:"render.go"})," generates terminal output"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Update"})," - ",e.jsx(n.code,{children:"update.go"})," handles messages:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"tea.KeyMsg"})," - Keyboard input"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"tea.MouseMsg"})," - Mouse events"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"tea.WindowSizeMsg"})," - Terminal resize"]}),`
`,e.jsx(n.li,{children:"Custom messages (window exit, PTY output)"}),`
`]}),`
`,e.jsx(n.h3,{id:"message-flow",children:"Message Flow"}),`
`,e.jsx(s,{chart:`graph TD
    A[User Input] --> B[Bubble Tea Event]
    B --> C[input.HandleInput]
    C --> D{Modal Router}
    D -->|Window Mode| E[Window Management]
    D -->|Terminal Mode| F[PTY.Write]
    D -->|Copy Mode| G[Selection/Navigation]
    E --> H[OS.Update]
    F --> H
    G --> H
    H --> I[Render View]`}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Flow Explanation:"})}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"User Input"})," - Keyboard or mouse event occurs"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Bubble Tea"})," - Event system captures input"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.code,{children:"input.HandleInput()"})})," - Central router receives event"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Modal Router"})," - Determines mode and routes to handler"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.code,{children:"OS.Update()"})})," - Handler modifies application state"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Render"})," - Screen updates based on new state"]}),`
`]}),`
`,e.jsx(n.h3,{id:"window-lifecycle",children:"Window Lifecycle"}),`
`,e.jsx(s,{chart:`flowchart LR
    A[NewWindow] --> B[CreatePTY]
    B --> C[StartShell]
    C --> D[Monitor Output]
    D --> E[Update Buffer]
    E --> F[Render View]
    F --> G{Exit?}
    G -->|Yes| H[Cleanup]
    G -->|No| D`}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Lifecycle Stages:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Creation"})," - PTY spawned, shell launched"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Monitor"})," - Background goroutine reads output"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Update"})," - Terminal emulator processes ANSI sequences"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Render"})," - Screen displays content"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Cleanup"})," - On exit, PTY closed, resources freed"]}),`
`]}),`
`,e.jsx(n.h2,{id:"testing",children:"Testing"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Run all tests"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"go"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./..."})]}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Run with race detection"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"go"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -race"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./..."})]}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Specific package"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"go"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./internal/config/..."})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"go"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./internal/tape/..."})]})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Test coverage:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Configuration validation"}),`
`,e.jsx(n.li,{children:"Tape parsing and execution"}),`
`,e.jsx(n.li,{children:"VT emulator sequences"}),`
`,e.jsx(n.li,{children:"Style cache behavior"}),`
`]}),`
`,e.jsx(n.h2,{id:"building-from-source",children:"Building from Source"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"git"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clone"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" https://github.com/gaurav-gosain/tuios.git"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"cd"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tuios"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"go"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" build"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -o"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tuios"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./cmd/tuios"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"./tuios"})})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Requirements:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Go 1.24+"}),`
`,e.jsx(n.li,{children:"C compiler (for PTY support)"}),`
`,e.jsx(n.li,{children:"Nerd Font (for icons)"}),`
`]}),`
`,e.jsx(n.h2,{id:"cross-platform-support",children:"Cross-Platform Support"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"PTY implementation:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Unix: ",e.jsx(n.code,{children:"terminal/pty_unix.go"})," (uses ",e.jsx(n.code,{children:"creack/pty"}),")"]}),`
`,e.jsxs(n.li,{children:["Windows: ",e.jsx(n.code,{children:"terminal/pty_windows.go"})," (uses ConPTY)"]}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Window sizing:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Unix: ",e.jsx(n.code,{children:"terminal/window_unix.go"})," (TIOCGWINSZ ioctl)"]}),`
`,e.jsxs(n.li,{children:["Windows: ",e.jsx(n.code,{children:"terminal/window_windows.go"})," (Windows Console API)"]}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"System info:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["macOS: ",e.jsx(n.code,{children:"system/sysinfo_darwin.go"})," (sysctl)"]}),`
`,e.jsxs(n.li,{children:["Linux: ",e.jsx(n.code,{children:"system/sysinfo_linux.go"})," (/proc, cgroups)"]}),`
`]}),`
`,e.jsx(n.h2,{id:"contributing",children:"Contributing"}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"https://github.com/Gaurav-Gosain/tuios/blob/main/docs/CONTRIBUTING.md",children:"CONTRIBUTING.md"})," in the main repository."]}),`
`,e.jsx(n.h2,{id:"related-documentation",children:"Related Documentation"}),`
`,e.jsxs(o,{children:[e.jsx(t,{title:"Configuration",href:"/docs/configuration",description:"Customize TUIOS settings"}),e.jsx(t,{title:"Tape Scripting",href:"/docs/tape-scripting",description:"Automate with tape files"}),e.jsx(t,{title:"CLI Reference",href:"/docs/cli-reference",description:"Command-line options"})]})]})}function g(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(l,{...i})}):l(i)}function r(i,n){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{g as default,c as frontmatter,d as structuredData,h as toc};
