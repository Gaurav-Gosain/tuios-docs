import{j as n,C as t,a as s,b as d}from"./main-PoOGVlt9.js";let c={title:"Keybindings",description:"Complete keyboard shortcut reference for TUIOS",icon:"Keyboard"},o={contents:[{heading:"keybindings-reference",content:"Complete keyboard shortcut reference for TUIOS. All keybindings are customizable through the configuration file."},{heading:"keybindings-reference",content:"title: Quick Tip"},{heading:"keybindings-reference",content:"type: tip"},{heading:"keybindings-reference",content:"Press Ctrl+B then ? from anywhere in TUIOS to see the help overlay!"},{heading:"modes",content:"TUIOS has two main modes:"},{heading:"modes",content:"Window Management Mode - Navigate and manage windows (default on startup)"},{heading:"modes",content:"Terminal Mode - Input goes directly to the focused terminal"},{heading:"mode-switching",content:"i or Enter - Enter Terminal Mode"},{heading:"mode-switching",content:"Ctrl+B then d or Esc - Return to Window Management Mode (from Terminal Mode)"},{heading:"mode-switching",content:"? (Window Mode) or Ctrl+B then ? (universal) - Toggle help overlay"},{heading:"mode-switching",content:"q (Window Mode) or Ctrl+B then q (universal) - Quit TUIOS"},{heading:"window-management",content:"n - Create new window"},{heading:"window-management",content:"w or x - Close focused window"},{heading:"window-management",content:"r - Rename focused window"},{heading:"window-management",content:"m - Minimize focused window"},{heading:"window-management",content:"Shift+M - Restore all minimized windows"},{heading:"window-management",content:"Tab - Focus next window"},{heading:"window-management",content:"Shift+Tab - Focus previous window"},{heading:"window-management",content:"1-9 - Select window by number"},{heading:"window-management",content:"Shift+1-9 or !@#$%^&*( - Restore minimized window by number"},{heading:"workspaces",content:"TUIOS supports 9 workspaces for organizing windows."},{heading:"workspaces",content:"Alt+1 through Alt+9 - Switch to workspace 1-9"},{heading:"workspaces",content:"Alt+Shift+1 through Alt+Shift+9 - Move window to workspace and follow"},{heading:"workspaces",content:"title: macOS Users"},{heading:"workspaces",content:"type: info"},{heading:"workspaces",content:"Use Option+1 through Option+9 (automatically configured by default)"},{heading:"manual-snapping-non-tiling-mode",content:"h - Snap window to left half"},{heading:"manual-snapping-non-tiling-mode",content:"l - Snap window to right half"},{heading:"manual-snapping-non-tiling-mode",content:"f - Fullscreen window"},{heading:"manual-snapping-non-tiling-mode",content:"u - Unsnap/restore window"},{heading:"manual-snapping-non-tiling-mode",content:"1 - Snap to top-left corner"},{heading:"manual-snapping-non-tiling-mode",content:"2 - Snap to top-right corner"},{heading:"manual-snapping-non-tiling-mode",content:"3 - Snap to bottom-left corner"},{heading:"manual-snapping-non-tiling-mode",content:"4 - Snap to bottom-right corner"},{heading:"tiling-mode",content:"t - Toggle automatic tiling mode"},{heading:"tiling-mode",content:"Shift+H or Ctrl+Left - Swap with window to the left"},{heading:"tiling-mode",content:"Shift+L or Ctrl+Right - Swap with window to the right"},{heading:"tiling-mode",content:"Shift+K or Ctrl+Up - Swap with window above"},{heading:"tiling-mode",content:"Shift+J or Ctrl+Down - Swap with window below"},{heading:"tiling-mode",content:"< or Shift+, - Decrease master window width (from right edge)"},{heading:"tiling-mode",content:"> or Shift+. - Increase master window width (from right edge)"},{heading:"tiling-mode",content:"{ or Shift+[ - Decrease focused window height (from bottom edge)"},{heading:"tiling-mode",content:"} or Shift+] - Increase focused window height (from bottom edge)"},{heading:"copy-mode",content:"Enter copy mode with Ctrl+B then [ to navigate scrollback and select text using vim-style commands."},{heading:"copy-mode",content:"title: Vim Users"},{heading:"copy-mode",content:"type: tip"},{heading:"copy-mode",content:"Copy mode supports 50+ vim motions including word movements, paragraph jumps, and search!"},{heading:"basic-navigation",content:"Ctrl+B then [ - Enter copy mode"},{heading:"basic-navigation",content:"h j k l - Move cursor left/down/up/right"},{heading:"basic-navigation",content:"w b e - Word forward / word backward / word end"},{heading:"basic-navigation",content:"0 ^ $ - Start of line / first non-blank / end of line"},{heading:"basic-navigation",content:"gg - Jump to top of scrollback"},{heading:"basic-navigation",content:"G - Jump to bottom (live output)"},{heading:"basic-navigation",content:"{number}G - Jump to line number (e.g., 10G)"},{heading:"basic-navigation",content:"{ } - Jump to previous/next paragraph"},{heading:"basic-navigation",content:"Ctrl+U Ctrl+D - Half page up/down"},{heading:"basic-navigation",content:"Ctrl+B Ctrl+F - Full page up/down"},{heading:"basic-navigation",content:"i - Return to terminal mode"},{heading:"basic-navigation",content:"q or Esc - Exit copy mode"},{heading:"count-prefix",content:"Prefix any motion with a number to repeat it:"},{heading:"count-prefix",content:"10j - Move down 10 lines"},{heading:"count-prefix",content:"5w - Move forward 5 words"},{heading:"count-prefix",content:"3{ - Jump up 3 paragraphs"},{heading:"character-search",content:"f{char} - Find next occurrence of char on line"},{heading:"character-search",content:"F{char} - Find previous occurrence of char on line"},{heading:"character-search",content:"t{char} - Move cursor before next char"},{heading:"character-search",content:"T{char} - Move cursor after previous char"},{heading:"character-search",content:"; - Repeat last character search"},{heading:"character-search",content:", - Repeat last search (opposite direction)"},{heading:"search",content:"/ - Search forward"},{heading:"search",content:"? - Search backward"},{heading:"search",content:"n - Next match"},{heading:"search",content:"N - Previous match"},{heading:"search",content:"Ctrl+L - Clear search highlights"},{heading:"visual-selection",content:"v - Enter visual character mode"},{heading:"visual-selection",content:"V - Enter visual line mode"},{heading:"visual-selection",content:"y or c - Yank (copy) selection to clipboard"},{heading:"visual-selection",content:"Esc or q - Exit visual mode"},{heading:"prefix-commands",content:"Press Ctrl+B, release, then press the command key (tmux-style)."},{heading:"prefix-commands",content:"title: Leader Key"},{heading:"prefix-commands",content:"type: info"},{heading:"prefix-commands",content:"The leader key (Ctrl+B by default) is configurable. See Configuration Guide for details."},{heading:"main-prefix-ctrlb",content:"Ctrl+B then c - Create new window"},{heading:"main-prefix-ctrlb",content:"Ctrl+B then x - Close current window"},{heading:"main-prefix-ctrlb",content:"Ctrl+B then , or r - Rename window"},{heading:"main-prefix-ctrlb",content:"Ctrl+B then n or Tab - Next window"},{heading:"main-prefix-ctrlb",content:"Ctrl+B then p or Shift+Tab - Previous window"},{heading:"main-prefix-ctrlb",content:"Ctrl+B then 0-9 - Jump to window"},{heading:"main-prefix-ctrlb",content:"Ctrl+B then Space - Toggle tiling mode"},{heading:"main-prefix-ctrlb",content:"Ctrl+B then z - Fullscreen current window"},{heading:"main-prefix-ctrlb",content:"Ctrl+B then w - Enter workspace prefix menu"},{heading:"main-prefix-ctrlb",content:"Ctrl+B then m - Enter minimize prefix menu"},{heading:"main-prefix-ctrlb",content:"Ctrl+B then t - Enter window prefix menu"},{heading:"main-prefix-ctrlb",content:"Ctrl+B then D - Enter debug prefix menu"},{heading:"main-prefix-ctrlb",content:"Ctrl+B then [ - Enter copy mode"},{heading:"main-prefix-ctrlb",content:"Ctrl+B then d or Esc - Detach (exit terminal mode)"},{heading:"main-prefix-ctrlb",content:"Ctrl+B then q - Quit TUIOS"},{heading:"main-prefix-ctrlb",content:"Ctrl+B then ? - Toggle help"},{heading:"main-prefix-ctrlb",content:"Ctrl+B then Ctrl+B - Send literal Ctrl+B to terminal"},{heading:"workspace-prefix-ctrlb-then-w",content:"Ctrl+B then w then 1-9 - Switch to workspace"},{heading:"workspace-prefix-ctrlb-then-w",content:"Ctrl+B then w then Shift+1-9 - Move window to workspace and follow"},{heading:"workspace-prefix-ctrlb-then-w",content:"Ctrl+B then w then Esc - Cancel"},{heading:"debug-prefix-ctrlb-then-d",content:"Access debug and development tools:"},{heading:"debug-prefix-ctrlb-then-d",content:"Ctrl+B then D then l - Toggle log viewer"},{heading:"debug-prefix-ctrlb-then-d",content:"Ctrl+B then D then c - Toggle cache statistics"},{heading:"debug-prefix-ctrlb-then-d",content:"Ctrl+B then D then k - Toggle showkeys overlay"},{heading:"debug-prefix-ctrlb-then-d",content:"Ctrl+B then D then Esc - Cancel"},{heading:"mouse-controls",content:"Left Click - Focus window"},{heading:"mouse-controls",content:"Left Drag - Move window (non-tiling) or swap windows (tiling)"},{heading:"mouse-controls",content:"Right Drag - Resize window (non-tiling only)"},{heading:"mouse-controls",content:"Title Bar Buttons - Minimize, maximize, or close window"},{heading:"mouse-controls",content:"Click Dock Item - Restore minimized window"},{heading:"mouse-controls",content:"Copy Mode Click - Move cursor to position"},{heading:"mouse-controls",content:"Copy Mode Drag - Select text (enters visual mode)"},{heading:"customization",content:"All keybindings can be customized in the configuration file. See the Configuration Guide for details."},{heading:"macos",content:"Default workspace switching uses Option key:"},{heading:"macos",content:"Option+1 through Option+9 - Switch workspace"},{heading:"macos",content:"Option+Shift+1 through Option+Shift+9 - Move window to workspace"},{heading:"macos",content:"You can still type Option key unicode characters (¡™£¢∞§¶•ª) in Terminal Mode."},{heading:"linux",content:"Uses standard Alt key for workspace switching:"},{heading:"linux",content:"Alt+1 through Alt+9"},{heading:"linux",content:"Alt+Shift+1 through Alt+Shift+9"}],headings:[{id:"keybindings-reference",content:"Keybindings Reference"},{id:"modes",content:"Modes"},{id:"mode-switching",content:"Mode Switching"},{id:"window-management",content:"Window Management"},{id:"workspaces",content:"Workspaces"},{id:"window-layout",content:"Window Layout"},{id:"manual-snapping-non-tiling-mode",content:"Manual Snapping (Non-Tiling Mode)"},{id:"tiling-mode",content:"Tiling Mode"},{id:"copy-mode",content:"Copy Mode"},{id:"basic-navigation",content:"Basic Navigation"},{id:"count-prefix",content:"Count Prefix"},{id:"character-search",content:"Character Search"},{id:"search",content:"Search"},{id:"visual-selection",content:"Visual Selection"},{id:"prefix-commands",content:"Prefix Commands"},{id:"main-prefix-ctrlb",content:"Main Prefix (Ctrl+B)"},{id:"workspace-prefix-ctrlb-then-w",content:"Workspace Prefix (Ctrl+B then w)"},{id:"debug-prefix-ctrlb-then-d",content:"Debug Prefix (Ctrl+B then D)"},{id:"mouse-controls",content:"Mouse Controls"},{id:"customization",content:"Customization"},{id:"quick-customization",content:"Quick Customization"},{id:"platform-specific-notes",content:"Platform-Specific Notes"},{id:"macos",content:"macOS"},{id:"linux",content:"Linux"},{id:"related-documentation",content:"Related Documentation"}]};const h=[{depth:1,url:"#keybindings-reference",title:n.jsx(n.Fragment,{children:"Keybindings Reference"})},{depth:2,url:"#modes",title:n.jsx(n.Fragment,{children:"Modes"})},{depth:3,url:"#mode-switching",title:n.jsx(n.Fragment,{children:"Mode Switching"})},{depth:2,url:"#window-management",title:n.jsx(n.Fragment,{children:"Window Management"})},{depth:2,url:"#workspaces",title:n.jsx(n.Fragment,{children:"Workspaces"})},{depth:2,url:"#window-layout",title:n.jsx(n.Fragment,{children:"Window Layout"})},{depth:3,url:"#manual-snapping-non-tiling-mode",title:n.jsx(n.Fragment,{children:"Manual Snapping (Non-Tiling Mode)"})},{depth:3,url:"#tiling-mode",title:n.jsx(n.Fragment,{children:"Tiling Mode"})},{depth:2,url:"#copy-mode",title:n.jsx(n.Fragment,{children:"Copy Mode"})},{depth:3,url:"#basic-navigation",title:n.jsx(n.Fragment,{children:"Basic Navigation"})},{depth:3,url:"#count-prefix",title:n.jsx(n.Fragment,{children:"Count Prefix"})},{depth:3,url:"#character-search",title:n.jsx(n.Fragment,{children:"Character Search"})},{depth:3,url:"#search",title:n.jsx(n.Fragment,{children:"Search"})},{depth:3,url:"#visual-selection",title:n.jsx(n.Fragment,{children:"Visual Selection"})},{depth:2,url:"#prefix-commands",title:n.jsx(n.Fragment,{children:"Prefix Commands"})},{depth:3,url:"#main-prefix-ctrlb",title:n.jsxs(n.Fragment,{children:["Main Prefix (",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"}),")"]})},{depth:3,url:"#workspace-prefix-ctrlb-then-w",title:n.jsxs(n.Fragment,{children:["Workspace Prefix (",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"w"}),")"]})},{depth:3,url:"#debug-prefix-ctrlb-then-d",title:n.jsxs(n.Fragment,{children:["Debug Prefix (",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"D"}),")"]})},{depth:2,url:"#mouse-controls",title:n.jsx(n.Fragment,{children:"Mouse Controls"})},{depth:2,url:"#customization",title:n.jsx(n.Fragment,{children:"Customization"})},{depth:3,url:"#quick-customization",title:n.jsx(n.Fragment,{children:"Quick Customization"})},{depth:2,url:"#platform-specific-notes",title:n.jsx(n.Fragment,{children:"Platform-Specific Notes"})},{depth:3,url:"#macos",title:n.jsx(n.Fragment,{children:"macOS"})},{depth:3,url:"#linux",title:n.jsx(n.Fragment,{children:"Linux"})},{depth:2,url:"#related-documentation",title:n.jsx(n.Fragment,{children:"Related Documentation"})}];function r(i){const e={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components};return n.jsxs(n.Fragment,{children:[n.jsx(e.h1,{id:"keybindings-reference",children:"Keybindings Reference"}),`
`,n.jsxs(e.p,{children:["Complete keyboard shortcut reference for TUIOS. All keybindings are customizable through the ",n.jsx(e.a,{href:"/docs/configuration",children:"configuration file"}),"."]}),`
`,n.jsx(t,{title:"Quick Tip",type:"tip",children:n.jsxs(e.p,{children:["Press ",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"?"})," from anywhere in TUIOS to see the help overlay!"]})}),`
`,n.jsx(e.h2,{id:"modes",children:"Modes"}),`
`,n.jsx(e.p,{children:"TUIOS has two main modes:"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Window Management Mode"})," - Navigate and manage windows (default on startup)"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Terminal Mode"})," - Input goes directly to the focused terminal"]}),`
`]}),`
`,n.jsx(e.h3,{id:"mode-switching",children:"Mode Switching"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"i"})," or ",n.jsx("kbd",{children:"Enter"})," - Enter Terminal Mode"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"d"})," or ",n.jsx("kbd",{children:"Esc"})," - Return to Window Management Mode (from Terminal Mode)"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"?"})," (Window Mode) or ",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"?"})," (universal) - Toggle help overlay"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"q"})," (Window Mode) or ",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"q"})," (universal) - Quit TUIOS"]}),`
`]}),`
`,n.jsx(e.h2,{id:"window-management",children:"Window Management"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"n"})," - Create new window"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"w"})," or ",n.jsx("kbd",{children:"x"})," - Close focused window"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"r"})," - Rename focused window"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"m"})," - Minimize focused window"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"M"})," - Restore all minimized windows"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Tab"})," - Focus next window"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"Tab"})," - Focus previous window"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"1"}),"-",n.jsx("kbd",{children:"9"})," - Select window by number"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"1"}),"-",n.jsx("kbd",{children:"9"})," or ",n.jsx("kbd",{children:"!@#$%^&*("})," - Restore minimized window by number"]}),`
`]}),`
`,n.jsx(e.h2,{id:"workspaces",children:"Workspaces"}),`
`,n.jsxs(e.p,{children:["TUIOS supports ",n.jsx(e.strong,{children:"9 workspaces"})," for organizing windows."]}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Alt"}),"+",n.jsx("kbd",{children:"1"})," through ",n.jsx("kbd",{children:"Alt"}),"+",n.jsx("kbd",{children:"9"})," - Switch to workspace 1-9"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Alt"}),"+",n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"1"})," through ",n.jsx("kbd",{children:"Alt"}),"+",n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"9"})," - Move window to workspace and follow"]}),`
`]}),`
`,n.jsx(t,{title:"macOS Users",type:"info",children:n.jsxs(e.p,{children:["Use ",n.jsx("kbd",{children:"Option"}),"+",n.jsx("kbd",{children:"1"})," through ",n.jsx("kbd",{children:"Option"}),"+",n.jsx("kbd",{children:"9"})," (automatically configured by default)"]})}),`
`,n.jsx(e.h2,{id:"window-layout",children:"Window Layout"}),`
`,n.jsx(e.h3,{id:"manual-snapping-non-tiling-mode",children:"Manual Snapping (Non-Tiling Mode)"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"h"})," - Snap window to left half"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"l"})," - Snap window to right half"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"f"})," - Fullscreen window"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"u"})," - Unsnap/restore window"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"1"})," - Snap to top-left corner"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"2"})," - Snap to top-right corner"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"3"})," - Snap to bottom-left corner"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"4"})," - Snap to bottom-right corner"]}),`
`]}),`
`,n.jsx(e.h3,{id:"tiling-mode",children:"Tiling Mode"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"t"})," - Toggle automatic tiling mode"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"H"})," or ",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"Left"})," - Swap with window to the left"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"L"})," or ",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"Right"})," - Swap with window to the right"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"K"})," or ",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"Up"})," - Swap with window above"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"J"})," or ",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"Down"})," - Swap with window below"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"<"})," or ",n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:","})," - Decrease master window width (from right edge)"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:">"})," or ",n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"."})," - Increase master window width (from right edge)"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"{"})," or ",n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"["})," - Decrease focused window height (from bottom edge)"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"}"})," or ",n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"]"})," - Increase focused window height (from bottom edge)"]}),`
`]}),`
`,n.jsx(e.h2,{id:"copy-mode",children:"Copy Mode"}),`
`,n.jsxs(e.p,{children:["Enter copy mode with ",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"["})," to navigate scrollback and select text using vim-style commands."]}),`
`,n.jsx(t,{title:"Vim Users",type:"tip",children:n.jsx(e.p,{children:"Copy mode supports 50+ vim motions including word movements, paragraph jumps, and search!"})}),`
`,n.jsx(e.h3,{id:"basic-navigation",children:"Basic Navigation"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"["})," - Enter copy mode"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"h"})," ",n.jsx("kbd",{children:"j"})," ",n.jsx("kbd",{children:"k"})," ",n.jsx("kbd",{children:"l"})," - Move cursor left/down/up/right"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"w"})," ",n.jsx("kbd",{children:"b"})," ",n.jsx("kbd",{children:"e"})," - Word forward / word backward / word end"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"0"})," ",n.jsx("kbd",{children:"^"})," ",n.jsx("kbd",{children:"$"})," - Start of line / first non-blank / end of line"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"g"}),n.jsx("kbd",{children:"g"})," - Jump to top of scrollback"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"G"})," - Jump to bottom (live output)"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"{number}"}),n.jsx("kbd",{children:"G"})," - Jump to line number (e.g., 10G)"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"{"})," ",n.jsx("kbd",{children:"}"})," - Jump to previous/next paragraph"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"U"})," ",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"D"})," - Half page up/down"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," ",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"F"})," - Full page up/down"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"i"})," - Return to terminal mode"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"q"})," or ",n.jsx("kbd",{children:"Esc"})," - Exit copy mode"]}),`
`]}),`
`,n.jsx(e.h3,{id:"count-prefix",children:"Count Prefix"}),`
`,n.jsx(e.p,{children:"Prefix any motion with a number to repeat it:"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"1"}),n.jsx("kbd",{children:"0"}),n.jsx("kbd",{children:"j"})," - Move down 10 lines"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"5"}),n.jsx("kbd",{children:"w"})," - Move forward 5 words"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"3"}),n.jsx("kbd",{children:"{"})," - Jump up 3 paragraphs"]}),`
`]}),`
`,n.jsx(e.h3,{id:"character-search",children:"Character Search"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"f"}),n.jsx("kbd",{children:"{char}"})," - Find next occurrence of char on line"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"F"}),n.jsx("kbd",{children:"{char}"})," - Find previous occurrence of char on line"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"t"}),n.jsx("kbd",{children:"{char}"})," - Move cursor before next char"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"T"}),n.jsx("kbd",{children:"{char}"})," - Move cursor after previous char"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:";"})," - Repeat last character search"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:","})," - Repeat last search (opposite direction)"]}),`
`]}),`
`,n.jsx(e.h3,{id:"search",children:"Search"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"/"})," - Search forward"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"?"})," - Search backward"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"n"})," - Next match"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"N"})," - Previous match"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"L"})," - Clear search highlights"]}),`
`]}),`
`,n.jsx(e.h3,{id:"visual-selection",children:"Visual Selection"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"v"})," - Enter visual character mode"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"V"})," - Enter visual line mode"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"y"})," or ",n.jsx("kbd",{children:"c"})," - Yank (copy) selection to clipboard"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Esc"})," or ",n.jsx("kbd",{children:"q"})," - Exit visual mode"]}),`
`]}),`
`,n.jsx(e.h2,{id:"prefix-commands",children:"Prefix Commands"}),`
`,n.jsxs(e.p,{children:["Press ",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"}),", release, then press the command key (tmux-style)."]}),`
`,n.jsx(t,{title:"Leader Key",type:"info",children:n.jsxs(e.p,{children:["The leader key (",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," by default) is configurable. See ",n.jsx(e.a,{href:"/docs/configuration",children:"Configuration Guide"})," for details."]})}),`
`,n.jsxs(e.h3,{id:"main-prefix-ctrlb",children:["Main Prefix (",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"}),")"]}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"c"})," - Create new window"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"x"})," - Close current window"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:","})," or ",n.jsx("kbd",{children:"r"})," - Rename window"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"n"})," or ",n.jsx("kbd",{children:"Tab"})," - Next window"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"p"})," or ",n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"Tab"})," - Previous window"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"0"}),"-",n.jsx("kbd",{children:"9"})," - Jump to window"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"Space"})," - Toggle tiling mode"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"z"})," - Fullscreen current window"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"w"})," - Enter workspace prefix menu"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"m"})," - Enter minimize prefix menu"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"t"})," - Enter window prefix menu"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"D"})," - Enter debug prefix menu"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"["})," - Enter copy mode"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"d"})," or ",n.jsx("kbd",{children:"Esc"})," - Detach (exit terminal mode)"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"q"})," - Quit TUIOS"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"?"})," - Toggle help"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," - Send literal Ctrl+B to terminal"]}),`
`]}),`
`,n.jsxs(e.h3,{id:"workspace-prefix-ctrlb-then-w",children:["Workspace Prefix (",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"w"}),")"]}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"w"})," then ",n.jsx("kbd",{children:"1"}),"-",n.jsx("kbd",{children:"9"})," - Switch to workspace"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"w"})," then ",n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"1"}),"-",n.jsx("kbd",{children:"9"})," - Move window to workspace and follow"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"w"})," then ",n.jsx("kbd",{children:"Esc"})," - Cancel"]}),`
`]}),`
`,n.jsxs(e.h3,{id:"debug-prefix-ctrlb-then-d",children:["Debug Prefix (",n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"D"}),")"]}),`
`,n.jsx(e.p,{children:"Access debug and development tools:"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"D"})," then ",n.jsx("kbd",{children:"l"})," - Toggle log viewer"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"D"})," then ",n.jsx("kbd",{children:"c"})," - Toggle cache statistics"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"D"})," then ",n.jsx("kbd",{children:"k"})," - Toggle showkeys overlay"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Ctrl"}),"+",n.jsx("kbd",{children:"B"})," then ",n.jsx("kbd",{children:"D"})," then ",n.jsx("kbd",{children:"Esc"})," - Cancel"]}),`
`]}),`
`,n.jsx(e.h2,{id:"mouse-controls",children:"Mouse Controls"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Left Click"})," - Focus window"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Left Drag"})," - Move window (non-tiling) or swap windows (tiling)"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Right Drag"})," - Resize window (non-tiling only)"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Title Bar Buttons"})," - Minimize, maximize, or close window"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Click Dock Item"})," - Restore minimized window"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Copy Mode Click"})," - Move cursor to position"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Copy Mode Drag"})," - Select text (enters visual mode)"]}),`
`]}),`
`,n.jsx(e.h2,{id:"customization",children:"Customization"}),`
`,n.jsxs(e.p,{children:["All keybindings can be customized in the configuration file. See the ",n.jsx(e.a,{href:"/docs/configuration",children:"Configuration Guide"})," for details."]}),`
`,n.jsx(e.h3,{id:"quick-customization",children:"Quick Customization"}),`
`,n.jsx(n.Fragment,{children:n.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:n.jsxs(e.code,{children:[n.jsx(e.span,{className:"line",children:n.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Edit your keybindings"})}),`
`,n.jsxs(e.span,{className:"line",children:[n.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"tuios"}),n.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" config"}),n.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" edit"})]}),`
`,n.jsx(e.span,{className:"line"}),`
`,n.jsx(e.span,{className:"line",children:n.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# View current configuration"})}),`
`,n.jsxs(e.span,{className:"line",children:[n.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"tuios"}),n.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" keybinds"}),n.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" list"})]}),`
`,n.jsx(e.span,{className:"line"}),`
`,n.jsx(e.span,{className:"line",children:n.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# View only your customizations"})}),`
`,n.jsxs(e.span,{className:"line",children:[n.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"tuios"}),n.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" keybinds"}),n.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" list-custom"})]})]})})}),`
`,n.jsx(e.h2,{id:"platform-specific-notes",children:"Platform-Specific Notes"}),`
`,n.jsx(e.h3,{id:"macos",children:"macOS"}),`
`,n.jsx(e.p,{children:"Default workspace switching uses Option key:"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Option"}),"+",n.jsx("kbd",{children:"1"})," through ",n.jsx("kbd",{children:"Option"}),"+",n.jsx("kbd",{children:"9"})," - Switch workspace"]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Option"}),"+",n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"1"})," through ",n.jsx("kbd",{children:"Option"}),"+",n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"9"})," - Move window to workspace"]}),`
`]}),`
`,n.jsx(e.p,{children:"You can still type Option key unicode characters (¡™£¢∞§¶•ª) in Terminal Mode."}),`
`,n.jsx(e.h3,{id:"linux",children:"Linux"}),`
`,n.jsx(e.p,{children:"Uses standard Alt key for workspace switching:"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Alt"}),"+",n.jsx("kbd",{children:"1"})," through ",n.jsx("kbd",{children:"Alt"}),"+",n.jsx("kbd",{children:"9"})]}),`
`,n.jsxs(e.li,{children:[n.jsx("kbd",{children:"Alt"}),"+",n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"1"})," through ",n.jsx("kbd",{children:"Alt"}),"+",n.jsx("kbd",{children:"Shift"}),"+",n.jsx("kbd",{children:"9"})]}),`
`]}),`
`,n.jsx(e.h2,{id:"related-documentation",children:"Related Documentation"}),`
`,n.jsxs(s,{children:[n.jsx(d,{title:"Configuration Guide",href:"/docs/configuration",description:"Customize keybindings and settings"}),n.jsx(d,{title:"CLI Reference",href:"/docs/cli-reference",description:"Command-line options and usage"})]})]})}function a(i={}){const{wrapper:e}=i.components||{};return e?n.jsx(e,{...i,children:n.jsx(r,{...i})}):r(i)}export{a as default,c as frontmatter,o as structuredData,h as toc};
