/** One example per diagram type sketch draws, for the playground. */
export type Example = { id: string; title: string; source: string };

export const EXAMPLES: Example[] = [
  {
    id: "flowchart",
    title: "Flowchart",
    source: `flowchart LR
  subgraph Make
    Idea --> Build
    Build --> Review{Ready?}
    Review -->|Not yet| Build
  end
  Review -->|Yes| Launch([Launch])
  Launch --> Users[(Users)]
  Users -.->|feedback| Idea
`,
  },
  {
    id: "sequence",
    title: "Sequence",
    source: `sequenceDiagram
  participant You
  participant tuios
  participant Shell
  You->>tuios: Press Ctrl+B c
  tuios->>Shell: Start a new pane
  Shell-->>tuios: Prompt
  tuios-->>You: Draw the pane
  Note over tuios,Shell: The daemon keeps the pane alive
`,
  },
  {
    id: "state",
    title: "State",
    source: `stateDiagram-v2
  [*] --> Idle
  Idle --> Working: task
  Working --> Waiting: needs input
  Waiting --> Working: reply
  Working --> Done: finish
  Done --> [*]
`,
  },
  {
    id: "class",
    title: "Class",
    source: `classDiagram
  class Session {
    +string Name
    +Windows() []Window
  }
  class Window {
    +int ID
    +Resize(w, h)
  }
  class Pane {
    +string Title
    +Write(data)
  }
  Session "1" *-- "many" Window
  Window "1" o-- "many" Pane
`,
  },
  {
    id: "er",
    title: "ER",
    source: `erDiagram
  USER ||--o{ SESSION : opens
  SESSION ||--|{ WINDOW : holds
  WINDOW ||--|{ PANE : splits
  USER {
    string name
    string email
  }
  PANE {
    int id
    string title
  }
`,
  },
  {
    id: "pie",
    title: "Pie",
    source: `pie title Where the time goes
  "Reading code" : 45
  "Writing code" : 25
  "Waiting on CI" : 20
  "Meetings" : 10
`,
  },
  {
    id: "mindmap",
    title: "Mindmap",
    source: `mindmap
  root((sketch))
    Diagrams
      Flowchart
      Sequence
      State
    Output
      SVG
      PNG
      Text
    Themes
`,
  },
  {
    id: "gantt",
    title: "Gantt",
    source: `gantt
  title A release
  dateFormat YYYY-MM-DD
  section Build
    Design      :done, a1, 2026-10-01, 4d
    Code        :active, a2, after a1, 7d
  section Ship
    Test        :a3, after a2, 3d
    Release     :milestone, after a3, 0d
`,
  },
];

export const DEFAULT_EXAMPLE = EXAMPLES[0];
