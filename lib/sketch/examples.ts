/**
 * The examples of the playground. The showcases come first: larger drawings
 * that show what sketch can do. Then one example for each diagram type.
 *
 * The colours have to read on every theme, light and dark:
 * - Flowchart and ER styles take only literal colours. A fill is a hue at a
 *   low alpha (#3b82f62e) with a solid stroke of the same hue, so the label
 *   keeps the theme's text colour.
 * - State and class styles take the theme tokens. A fill is
 *   var(--pele-series-N) at fill-opacity 0.18, so it follows the theme.
 * - Sequence boxes and rects take rgba() with a low alpha. Where they
 *   overlap the colours mix, so a rect stays rare.
 * - The other types set no colours. They take every colour from the theme.
 */
export const GROUPS = ["Showcase", "Diagram types"] as const;

export type Example = {
  id: string;
  title: string;
  group: (typeof GROUPS)[number];
  source: string;
};

export const EXAMPLES: Example[] = [
  {
    id: "architecture",
    title: "tuios architecture",
    group: "Showcase",
    source: `flowchart TB
  subgraph clients [Clients]
    tui([Terminal UI])
    web([Web browser])
    ssh([SSH])
    phone([Phone])
  end

  subgraph laptop [Laptop daemon]
    direction TB
    wire{{Wire protocol}}
    subgraph sessions [Sessions]
      dev[[dev]]
      ops[[ops]]
      review[[review]]
    end
    subgraph panes [Panes]
      zsh[zsh]
      nvim[nvim]
      claude[claude]
      codex[codex]
    end
    vt[(VT and scrollback)]
    wire --> sessions --> panes --> vt
  end

  subgraph cockpit [Agent cockpit]
    direction LR
    inbox>Inbox] --> ask{Approve?}
  end

  subgraph server [Build server daemon]
    cargo[cargo test]
    bench[benchmarks]
  end

  clients ==>|attach| wire
  panes -.->|needs input| cockpit
  cockpit -->|reply| panes
  wire <-->|federation| server

  classDef client fill:#3b82f62e,stroke:#3b82f6,stroke-width:2px
  classDef core fill:#a855f72e,stroke:#a855f7,stroke-width:2px
  classDef pane fill:#22c55e2e,stroke:#22c55e,stroke-width:2px
  classDef agent fill:#f973162e,stroke:#f97316,stroke-width:2px
  classDef remote fill:#14b8a62e,stroke:#14b8a6,stroke-width:2px
  class tui,web,ssh,phone client
  class wire,dev,ops,review,vt core
  class zsh,nvim pane
  class claude,codex,inbox,ask agent
  class cargo,bench remote
  style laptop fill:#a855f70d,stroke:#a855f7,stroke-dasharray:6 4
  style server fill:#14b8a60d,stroke:#14b8a6,stroke-dasharray:6 4
  style cockpit fill:#f973160d,stroke:#f97316
  linkStyle 4 stroke:#3b82f6,stroke-width:3px
  linkStyle 5,6 stroke:#f97316,stroke-width:2px
  linkStyle 7 stroke:#14b8a6,stroke-width:3px
`,
  },
  {
    id: "release-pipeline",
    title: "Release pipeline",
    group: "Showcase",
    source: `flowchart TB
  tag([git tag v1.0.0]) --> ci{{CI}}

  subgraph test [Test]
    lint[Lint]:::pass
    unit[Unit tests]:::pass
    e2e[E2E suite]:::pass
    fuzz[Fuzz seeds]:::pass
  end

  subgraph build [Build]
    linux[Linux]:::pass
    mac[macOS]:::pass
    win[Windows]:::run
    wasm[WebAssembly]:::pass
  end

  subgraph publish [Publish]
    gh[(GitHub release)]:::wait
    brew[(Homebrew)]:::wait
    aur[(AUR)]:::fail
    docker[(Docker)]:::wait
  end

  ci --> test --> gate{All green?}
  gate -->|yes| build
  gate -->|no| fix[/Fix and tag again/]:::fail
  fix -.-> tag
  build --> publish
  publish --> notes[/Release notes/]:::wait
  aur -.->|retry| aur
  notes --> done(((Shipped))):::wait

  classDef step fill:#3b82f62e,stroke:#3b82f6,stroke-width:2px
  class tag,ci,gate step
  classDef pass fill:#22c55e2e,stroke:#22c55e,stroke-width:2px
  classDef run fill:#eab3082e,stroke:#eab308,stroke-width:2px,stroke-dasharray:5 3
  classDef fail fill:#ef44442e,stroke:#ef4444,stroke-width:3px
  classDef wait fill:#64748b1f,stroke:#64748b,stroke-dasharray:3 3
  style test fill:#22c55e0d,stroke:#22c55e
  style build fill:#eab3080d,stroke:#eab308
  style publish fill:#64748b0d,stroke:#64748b
  linkStyle 0,1,2,3 stroke:#22c55e,stroke-width:3px
  linkStyle 4,5 stroke:#ef4444,stroke-width:2px
  linkStyle 6 stroke:#eab308,stroke-width:2px,stroke-dasharray:5 3
  linkStyle 8 stroke:#ef4444,stroke-width:2px
`,
  },
  {
    id: "live-upgrade",
    title: "Live daemon upgrade",
    group: "Showcase",
    source: `sequenceDiagram
  autonumber
  actor You
  box rgba(59,130,246,0.12) Daemons
    participant Old as v0.9
    participant New as v1.0
  end
  box rgba(34,197,94,0.12) Pane programs
    participant Shell as zsh
    participant Agent as claude
  end

  You->>+Old: tuios update
  Note over Old,Agent: The pane programs keep running.<br/>Only the daemon changes.
  Old->>+New: Start with the PTY handles
  par Hand over each pane
    Old-)New: zsh: PTY and screen
  and
    Old-)New: claude: PTY and screen
  end
  critical Check every pane
    New->>Shell: Read
    Shell-->>New: Prompt
    New->>Agent: Read
    Agent-->>New: Working
  option A pane does not answer
    New--xOld: Abort
  end
  New-->>-Old: All panes are here
  Old-->>-You: Done, exiting
  rect rgba(168,85,247,0.14)
    loop Every client
      New->>You: Redraw from the snapshot
    end
  end
  Agent->>New: Needs input
  New->>You: Show it in the Inbox
`,
  },
  {
    id: "flowchart",
    title: "Flowchart",
    group: "Diagram types",
    source: `flowchart TB
  key([Key press]) --> mode{Mode?}
  mode -->|Terminal| pty[/Write to the PTY/]
  mode -->|Prefix| prefix{{Leader key}}
  mode -->|Window| wm[[Window action]]

  subgraph pane [Inside the pane]
    pty --> vt[VT emulator]
    vt --> grid[(Cell grid)]
  end

  prefix -->|c| new[New pane]
  prefix -->|"["| copy[Copy mode]
  prefix -->|w| ws[Workspace]
  wm & new & copy & ws --> layout[Layout]
  grid & layout ==> frame((Frame))

  classDef input fill:#3b82f62e,stroke:#3b82f6,stroke-width:2px
  classDef inner fill:#22c55e2e,stroke:#22c55e,stroke-width:2px
  classDef action fill:#a855f72e,stroke:#a855f7,stroke-width:2px
  classDef out fill:#f973162e,stroke:#f97316,stroke-width:2px
  class key,mode input
  class pty,vt,grid inner
  class prefix,wm,new,copy,ws,layout action
  class frame out
  style pane fill:#22c55e0d,stroke:#22c55e,stroke-dasharray:6 4
  linkStyle 13,14 stroke:#f97316,stroke-width:3px
`,
  },
  {
    id: "sequence",
    title: "Sequence",
    group: "Diagram types",
    source: `sequenceDiagram
  autonumber
  box rgba(168,85,247,0.12) You
    actor You
    participant Inbox
  end
  box rgba(59,130,246,0.12) Laptop
    participant Daemon
    participant Agent as claude
    participant Repo as git
  end

  You->>Daemon: Start an agent in a worktree
  Daemon->>+Agent: Spawn in a new pane
  loop Until the task is done
    Agent->>Repo: Read and edit files
    opt A risky command
      Agent->>Daemon: Ask to run rm -rf build/
      Daemon->>Inbox: Add an approval
      Inbox->>You: Notify
      alt You approve
        You->>Inbox: Allow once
        Inbox-->>Agent: Allowed
      else You refuse
        You->>Inbox: Deny, with a note
        Inbox-->>Agent: Denied
      end
    end
  end
  Agent->>Repo: Commit
  Agent-->>-Daemon: Done
  Note over Daemon,Repo: The worktree keeps the diff for review
  Daemon->>You: Show the diff
`,
  },
  {
    id: "state",
    title: "State",
    group: "Diagram types",
    source: `stateDiagram-v2
  direction TB
  state spread <<fork>>
  state gather <<join>>
  state check <<choice>>

  [*] --> Idle
  Idle --> Working: task

  state Working {
    [*] --> Thinking
    Thinking --> Tool: call a tool
    Tool --> Thinking: result
    state Tool {
      direction LR
      [*] --> Reading
      Reading --> Editing
      Editing --> Testing
      Testing --> [*]
    }
  }

  Working --> spread: plan has parts
  spread --> SubagentA
  spread --> SubagentB
  SubagentA --> gather
  SubagentB --> gather
  gather --> Working: merge

  Working --> check: stop
  check --> Waiting: needs input
  check --> Done: finished
  check --> Failed: error
  Waiting --> Working: reply
  Failed --> Idle: retry
  Done --> [*]

  note right of Waiting
    Shows in the Inbox
  end note

  classDef busy fill:var(--pele-series-6),fill-opacity:0.18,stroke:var(--pele-series-6),stroke-width:2px
  classDef wait fill:var(--pele-series-3),fill-opacity:0.18,stroke:var(--pele-series-3),stroke-width:2px
  classDef good fill:var(--pele-series-4),fill-opacity:0.18,stroke:var(--pele-series-4),stroke-width:2px
  classDef bad fill:var(--pele-series-1),fill-opacity:0.18,stroke:var(--pele-series-1),stroke-width:2px
  classDef sub fill:var(--pele-series-7),fill-opacity:0.18,stroke:var(--pele-series-7),stroke-width:2px
  class Thinking,Reading,Editing,Testing busy
  class Waiting wait
  class Done good
  class Failed bad
  class SubagentA,SubagentB sub
`,
  },
  {
    id: "class",
    title: "Class",
    group: "Diagram types",
    source: `classDiagram
  direction TB
  class Daemon {
    <<service>>
    -sessions map~string, Session~
    -hosts List~Host~
    +Attach(client Client) error
    +Upgrade(binary string) error
  }
  class Session {
    +Name string
    +Workspaces [9]Workspace
    +Panes() List~Pane~
  }
  class Pane {
    +ID int
    +Title string
    -pty PTY
    +Write(data []byte)
    +Snapshot() Screen
  }
  class Agent {
    <<interface>>
    +State() AgentState
    +Reply(text string)
  }
  class ClaudeCode
  class Codex
  class AgentState {
    <<enumeration>>
    Working
    Waiting
    Done
  }
  class Host {
    +Name string
    +Link() Link$
  }

  Daemon "1" *-- "*" Session : owns
  Daemon "1" o-- "*" Host : links to
  Session "1" *-- "*" Pane : holds
  Agent "0..1" <-- "1" Pane : runs
  Agent <|.. ClaudeCode
  Agent <|.. Codex
  Agent ..> AgentState : reports

  note for Daemon "One per machine.<br/>Panes live here."

  classDef core fill:var(--pele-series-6),fill-opacity:0.18,stroke:var(--pele-series-6),stroke-width:2px
  classDef agent fill:var(--pele-series-2),fill-opacity:0.18,stroke:var(--pele-series-2),stroke-width:2px
  classDef data fill:var(--pele-series-4),fill-opacity:0.18,stroke:var(--pele-series-4),stroke-width:2px
  cssClass "Daemon,Session,Pane" core
  cssClass "Agent,ClaudeCode,Codex" agent
  cssClass "AgentState,Host" data
`,
  },
  {
    id: "er",
    title: "ER",
    group: "Diagram types",
    source: `erDiagram
  HOST ||--o{ SESSION : runs
  USER ||--o{ SESSION : "attaches to"
  SESSION ||--|{ PANE : holds
  AGENT |o--|| PANE : "runs in"
  AGENT ||--o{ APPROVAL : asks
  USER ||--o{ APPROVAL : answers
  AGENT ||--o{ CHECKPOINT : saves

  HOST {
    string name PK
    string address UK
    string version
  }
  SESSION {
    string name PK
    string host FK
    datetime started
  }
  PANE {
    int id PK
    string cwd
    string program
  }
  AGENT {
    int pane FK
    string harness "claude or codex"
    string state "working, waiting, done"
  }
  APPROVAL {
    int id PK
    string command
    bool allowed
  }
  CHECKPOINT {
    string id PK
    string commit
  }
  USER {
    string login PK
    string theme
  }

  classDef machine fill:#3b82f62e,stroke:#3b82f6
  classDef live fill:#22c55e2e,stroke:#22c55e
  classDef agent fill:#f973162e,stroke:#f97316
  classDef person fill:#a855f72e,stroke:#a855f7
  class HOST,SESSION machine
  class PANE live
  class USER person
  class AGENT,APPROVAL,CHECKPOINT agent
`,
  },
  {
    id: "pie",
    title: "Pie",
    group: "Diagram types",
    source: `pie showData
  title Where a week of CI minutes goes
  "E2E suite" : 412
  "Ghostty backend" : 236
  "Unit tests" : 188
  "Fuzz, nightly" : 164
  "Release builds" : 121
  "WebAssembly" : 74
  "Lint and vet" : 52
  "Docs site" : 38
`,
  },
  {
    id: "mindmap",
    title: "Mindmap",
    group: "Diagram types",
    source: `mindmap
  root((tuios))
    Panes
      Tiling
        Master and stack
        Grid
      Floating
      Copy mode
        Vim motions
        Search
    Agents
      Harnesses
        Claude Code
        Codex
      Inbox
        Approvals
        Replies
      ))Checkpoints((
    Hosts
      [Laptop]
      )Build server(
      {{Phone}}
        Collie
    Libraries
      vt
        Pure Go
        libghostty
      sketch
        Mermaid
        SVG and PNG
      plot
      loom
    Themes
      Catppuccin
      Nord
      Omarchy
`,
  },
  {
    id: "gantt",
    title: "Gantt",
    group: "Diagram types",
    source: `gantt
  title tuios 1.0
  dateFormat YYYY-MM-DD
  axisFormat %b %d
  tickInterval 1week
  excludes weekends
  todayMarker off

  section Design
    Agent cockpit       :done, d1, 2026-10-01, 5d
    Plugin API          :done, d2, after d1, 4d
    Design review       :milestone, m1, after d2, 0d

  section Build
    Inbox and replies   :crit, done, b1, after d2, 6d
    Plugin runtime      :active, b2, after d2, 9d
    Live upgrade        :crit, active, b3, after b1, 8d
    Phone client        :b4, after b2, 6d

  section Ship
    Freeze              :milestone, m2, after b3, 0d
    Release candidate   :crit, s1, after b3, 4d
    Docs and videos     :s2, after b4, 5d
    1.0 release         :milestone, m3, after s1, 0d
`,
  },
  {
    id: "xychart",
    title: "XY chart",
    group: "Diagram types",
    source: `xychart
  title "Idle CPU of a session, by release"
  x-axis [v0.4, v0.5, v0.6, v0.7, v0.8, v0.9]
  y-axis "Wakeups per minute" 0 --> 1400
  bar [1200, 960, 610, 340, 120, 45]
  line [1200, 960, 610, 340, 120, 45]
`,
  },
  {
    id: "quadrant",
    title: "Quadrant chart",
    group: "Diagram types",
    source: `quadrantChart
  title Which bug to fix first
  x-axis Rare --> Common
  y-axis Small harm --> Large harm
  quadrant-1 Fix now
  quadrant-2 Plan a fix
  quadrant-3 Leave it
  quadrant-4 Quick win
  Lost scrollback on upgrade: [0.35, 0.9]
  Flaky attach test: [0.8, 0.55]
  Wrong glyph width: [0.7, 0.25]
  Slow first frame: [0.9, 0.7]
  Mouse drag in nvim: [0.66, 0.38]
  Theme flicker: [0.25, 0.15]
  Dead pane on resize: [0.15, 0.75]
  Typo in help: [0.6, 0.08]
`,
  },
  {
    id: "radar",
    title: "Radar",
    group: "Diagram types",
    source: `radar-beta
  title Release health
  axis cpu["Idle CPU"], mem["Memory"], start["Startup"]
  axis size["Binary size"], tests["E2E cover"], docs["Docs"]
  curve old["v0.8"]{3, 3, 4, 3, 2, 3}
  curve new["v0.9"]{5, 4, 4, 2, 4, 4}
  max 5
  graticule polygon
`,
  },
  {
    id: "sankey",
    title: "Sankey",
    group: "Diagram types",
    source: `sankey

Key presses,Shell,47
Key presses,Agent,35
Key presses,Leader key,18
Shell,Pane redraw,47
Agent,Pane redraw,30
Agent,Inbox,5
Leader key,Layout change,11
Leader key,Copy mode,7
`,
  },
  {
    id: "treemap",
    title: "Treemap",
    group: "Diagram types",
    source: `treemap-beta
"tuios, thousands of lines of Go"
    "Window manager"
        "internal/app": 145
        "internal/config": 26
        "internal/input": 15
    "Daemon and CLI"
        "internal/session": 105
        "cmd/tuios": 39
    "Libraries"
        "sketch": 37
        "vt": 27
        "tml": 7
        "loom": 6
`,
  },
  {
    id: "venn",
    title: "Venn",
    group: "Diagram types",
    source: `venn-beta
  title What tuios is
  set mux["Multiplexer"]
  set wm["Window manager"]
  set cockpit["Agent cockpit"]
  union mux,wm["Tiling panes"]
  union wm,cockpit["Agent rail"]
  union mux,cockpit["Detached agents"]
  union mux,wm,cockpit["tuios"]
`,
  },
  {
    id: "timeline",
    title: "Timeline",
    group: "Diagram types",
    source: `timeline
  title A release week
  section Freeze
    Monday : Cut the release branch
           : Move the library pins
    Tuesday : Run the full E2E suite
            : Fuzz overnight
  section Check
    Wednesday : Fix what the fuzzer found
    Thursday : Release candidate on every platform
             : Write the release notes
  section Ship
    Friday : Tag the release
           : Homebrew, AUR and Docker
           : Post the clips
`,
  },
  {
    id: "journey",
    title: "User journey",
    group: "Diagram types",
    source: `journey
  title Your first hour with tuios
  section Install
    Run the install script: 5: You
  section Panes
    Split and tile panes: 5: You
    Learn the leader key: 3: You
  section Agents
    Start an agent: 5: You, Agent
    Wait for an approval: 2: You, Agent
    Approve from the Inbox: 5: You, Agent
  section Away
    Detach and close the laptop: 4: You
    Attach from the phone: 5: You, Agent
`,
  },
  {
    id: "gitgraph",
    title: "Git graph",
    group: "Diagram types",
    source: `gitGraph
  commit id: "v0.8.0" tag: "v0.8.0"
  commit id: "fix scrollback"
  branch feat/inbox
  checkout feat/inbox
  commit id: "inbox model"
  commit id: "reply composer"
  checkout main
  branch fix/attach-race
  checkout fix/attach-race
  commit id: "fix the race" type: HIGHLIGHT
  checkout main
  merge fix/attach-race
  checkout feat/inbox
  commit id: "paste chips"
  checkout main
  merge feat/inbox
  commit id: "release notes"
  commit id: "v0.9.0" tag: "v0.9.0"
`,
  },
  {
    id: "kanban",
    title: "Kanban",
    group: "Diagram types",
    source: `kanban
  todo[To do]
    t1[Plugin registry]@{ priority: 'Low' }
    t2[Sixel in copy mode]@{ priority: 'Very Low' }
  doing[In progress]
    t3[Live daemon upgrade]@{ assigned: 'claude', priority: 'Very High' }
    t4[Phone client]@{ assigned: 'codex', priority: 'High' }
  review[In review]
    t5[Inbox reply composer]@{ assigned: 'claude' }
  done[Done]
    t6[Sketch draws sankey diagrams]
    t7[Omarchy themes]
`,
  },
  {
    id: "swimlane",
    title: "Swimlane",
    group: "Diagram types",
    source: `swimlane-beta LR
  subgraph Agent
    branch[Make a worktree]
    code[Write the change]
    push[Push the branch]
  end

  subgraph CI
    test[Run the tests]
    green{Green?}
  end

  subgraph You
    review[Review the diff]
    merge[Merge]
  end

  branch --> code --> push --> test --> green
  green -->|no| code
  green -->|yes| review
  review -->|changes| code
  review -->|approve| merge
`,
  },
  {
    id: "eventmodeling",
    title: "Event modeling",
    group: "Diagram types",
    source: `eventmodeling

tf 01 ui AgentPane
tf 02 cmd RunTool { command: string }
tf 03 evt ApprovalAsked { tool: string }
tf 04 rmo Inbox ->> 03
tf 05 ui InboxPanel
tf 06 cmd Approve { allow: bool }
tf 07 evt ApprovalGranted { by: string }
tf 08 pcr AgentResumer
tf 09 evt ToolRan { exit: int }
`,
  },
  {
    id: "block",
    title: "Block",
    group: "Diagram types",
    source: `block
  columns 4
  tui["Terminal"] web["Web"] ssh["SSH"] phone["Phone"]
  attach<["attach"]>(down):4
  block:daemon:4
    columns 3
    wire{{"Wire protocol"}}:3
    sessions["Sessions"] panes["Panes"] agents["Agents"]
  end
  vt[("VT and scrollback")]:2 pty(["PTY"]) links(["Host links"])
`,
  },
  {
    id: "architecture-diagram",
    title: "Architecture",
    group: "Diagram types",
    source: `architecture-beta
  group laptop(server)[Laptop]
  service client(internet)[Terminal client] in laptop
  service daemon(server)[tuios daemon] in laptop
  service state(disk)[Session state] in laptop

  group build(cloud)[Build server]
  service remote(server)[Remote daemon] in build
  service cache(database)[Build cache] in build

  service phone(internet)[Phone]

  client:R --> L:daemon
  daemon:B --> T:state
  daemon:R <--> L:remote
  remote:R --> L:cache
  phone:T --> B:remote
`,
  },
  {
    id: "c4",
    title: "C4",
    group: "Diagram types",
    source: `C4Context
  title tuios in its surroundings
  Person(dev, "Developer", "Works in panes and answers agents")
  System(tuios, "tuios", "Multiplexer, window manager and agent cockpit")
  System_Ext(agents, "Coding agents", "Claude Code, Codex and others")
  System_Ext(git, "Git host", "Pull requests and CI")
  System_Ext(hosts, "Other machines", "Remote tuios daemons")
  Person(phone, "Developer on a phone", "Approves from anywhere")

  Rel(dev, tuios, "Types into")
  Rel(phone, tuios, "Attaches over SSH")
  Rel(tuios, agents, "Runs in panes")
  Rel(agents, git, "Pushes branches to")
  Rel(tuios, hosts, "Links to")
`,
  },
  {
    id: "packet",
    title: "Packet",
    group: "Diagram types",
    source: `packet
  title A tagged tuios wire frame
  0-31: "Length of the rest of the frame"
  32-39: "Message type"
  40-47: "Codec"
  48-111: "Request id"
  112-127: "gob payload"
`,
  },
  {
    id: "requirement",
    title: "Requirement",
    group: "Diagram types",
    source: `requirementDiagram

  requirement live_upgrade {
    id: 1
    text: A new daemon binary takes over without ending pane programs.
    risk: high
    verifymethod: test
  }

  functionalRequirement keep_ptys {
    id: 1.1
    text: The old daemon hands every PTY to the new one.
    risk: high
    verifymethod: test
  }

  performanceRequirement short_gap {
    id: 1.2
    text: Clients see a gap of less than 200 ms.
    risk: medium
    verifymethod: analysis
  }

  interfaceRequirement same_wire {
    id: 1.3
    text: Old clients attach to the new daemon.
    risk: low
    verifymethod: inspection
  }

  element handoff {
    type: "Go package"
    docref: internal/session
  }

  element e2e {
    type: "E2E test"
    docref: e2e/tui
  }

  live_upgrade - contains -> keep_ptys
  live_upgrade - contains -> short_gap
  live_upgrade - contains -> same_wire
  handoff - satisfies -> keep_ptys
  e2e - verifies -> live_upgrade
`,
  },
  {
    id: "usecase",
    title: "Use case",
    group: "Diagram types",
    source: `usecase-beta
direction LR
actor Dev("Developer")
actor Agent("Coding agent")
systemBoundary tuios["tuios"]
  Split("Split and tile panes")
  Start("Start an agent")
  Approve("Approve a command")
  Review("Review the diff")
  Ask("Ask for approval")
  Push("Push a branch")
end
Dev --> Split
Dev --> Start
Dev --> Approve
Dev --> Review
Agent --> Ask
Agent --> Push
Approve ..> : include Ask
`,
  },
  {
    id: "agentflow",
    title: "Agentflow",
    group: "Diagram types",
    source: `agentflow-beta TB
  issue["Bug report"]@{ shape: input }

  flow fixer["Fixer agent"]
    repro["Reproduce the bug"]@{ shape: task }
    tests["go test"]@{ shape: tool }
    patch["Write the fix"]@{ shape: task }
    guide["AGENTS.md"]@{ shape: refdoc }
    repro --> tests --> patch
    patch -.- guide
  end

  flow reviewer["Review agent"]
    read["Read the diff"]@{ shape: task }
    ok["Fix is right?"]@{ shape: decision }
    read --> ok
  end

  pr["Open the pull request"]@{ shape: action }
  issue --> fixer
  fixer --> reviewer
  ok -- yes --> pr
`,
  },
  {
    id: "ishikawa",
    title: "Ishikawa",
    group: "Diagram types",
    source: `ishikawa-beta
    Flaky E2E test
    Timing
        Fixed sleeps
        Reply hook race
    Machine
        Busy CI runner
        Slow disk
    Test
        Shared HOME
        Leftover daemon
    Code
        Unbuffered channel
        Missing condition wait
    Terminal
        Wrong TERM
        Small window
`,
  },
  {
    id: "cynefin",
    title: "Cynefin",
    group: "Diagram types",
    source: `cynefin-beta
  title Kinds of work on tuios

  clear
    "Move a library pin"
    "Fix a typo in help"

  complicated
    "Port a Mermaid renderer"
    "Speed up the VT parser"

  complex
    "Design the agent cockpit"

  chaotic
    "Release broke on Windows"

  chaotic --> complex : "Stabilized"
  complex --> complicated : "Pattern found"
  complicated --> clear : "Written down"
`,
  },
  {
    id: "wardley",
    title: "Wardley map",
    group: "Diagram types",
    source: `wardley-beta
title tuios value chain

evolution Genesis@0.25 -> Custom@0.5 -> Product@0.75 -> Commodity@1.0

anchor Developer [0.95, 0.6]

component "Agent cockpit" [0.82, 0.22] (build)
component "Window manager" [0.72, 0.56] (build)
component "Coding agents" [0.58, 0.36] (buy)
component "Session daemon" [0.5, 0.45] (build)
component "VT emulator" [0.35, 0.6] (build)
component "SSH" [0.2, 0.88] (buy)
component "PTY" [0.12, 0.95] (market)

Developer -> "Agent cockpit"
Developer -> "Window manager"
"Agent cockpit" -> "Coding agents"
"Agent cockpit" -> "Session daemon"
"Window manager" -> "Session daemon"
"Session daemon" -> "VT emulator"
"Session daemon" -> "SSH"
"VT emulator" -> "PTY"

evolve "Agent cockpit" 0.45
`,
  },
  {
    id: "treeview",
    title: "Tree view",
    group: "Diagram types",
    source: `treeView-beta
    tuios/
        cmd/
            tuios/
            tuios-web/
            tuios-wasm/
        internal/
            app/
            session/
            input/
            terminal/
        vt/
        sketch/
            raster/
            text/
        docs/
        go.mod
        go.work
        AGENTS.md
`,
  },
  {
    id: "railroad",
    title: "Railroad",
    group: "Diagram types",
    source: `railroad-ebnf-beta
title "Agent selector"

selector = term ( space term )* ;
term = key ":" value ( "," value )* ;
key = "harness" | "state" | "needs" | "session" | "group" | "host" | "name" | "cwd" ;
value = glob | "you" ;
`,
  },
];

/** The first drawing a visitor sees: the largest showcase. */
export const DEFAULT_EXAMPLE = EXAMPLES[0];
