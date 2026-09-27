import { Step, Steps } from "fumadocs-ui/components/steps";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { InboxDemo } from "@/components/docs/inbox-demo";
import { KeybindingExplorer } from "@/components/docs/keybinding-explorer";
import { LayoutModes } from "@/components/docs/layout-modes";
import { ReviewWalkthrough } from "@/components/docs/review-walkthrough";
import { SessionDiagram } from "@/components/docs/session-diagram";
import { AgentSourceTimeline } from "@/components/mdx/agent-source-timeline";
import { AuditChurn } from "@/components/mdx/audit-churn";
import { BacklogFeel } from "@/components/mdx/backlog-feel";
import { BenchBars } from "@/components/mdx/bench-bars";
import { BinarySizeWaterfall } from "@/components/mdx/binary-size-waterfall";
import { CellShape } from "@/components/mdx/cell-shape";
import { ClipWidth } from "@/components/mdx/clip-width";
import { ClusterExplorer } from "@/components/mdx/cluster-explorer";
import { DaemonTilePlacement } from "@/components/mdx/daemon-tile-placement";
import { DividerCollide } from "@/components/mdx/divider-collide";
import { ExtentScan } from "@/components/mdx/extent-scan";
import { HardTabHole } from "@/components/mdx/hard-tab-hole";
import { HeadlessTerm } from "@/components/mdx/headless-term";
import { HelpKeyDrift } from "@/components/mdx/help-key-drift";
import { InvariantBlind } from "@/components/mdx/invariant-blind";
import { JsonByteLoss } from "@/components/mdx/json-byte-loss";
import { KeptTestBar } from "@/components/mdx/kept-test-bar";
import { KeycastDemo } from "@/components/mdx/keycast-demo";
import { LineDiscipline } from "@/components/mdx/line-discipline";
import { LinkLanes } from "@/components/mdx/link-lanes";
import { MailboxSandbox } from "@/components/mdx/mailbox-sandbox";
import { MediumProbe } from "@/components/mdx/medium-probe";
import { Mermaid } from "@/components/mdx/mermaid";
import { NegativeControlBench } from "@/components/mdx/negative-control-bench";
import { PaneBoxNegotiation } from "@/components/mdx/pane-box-negotiation";
import { PreshapedGuard } from "@/components/mdx/preshaped-guard";
import { QueryPath } from "@/components/mdx/query-path";
import { RatioDrift } from "@/components/mdx/ratio-drift";
import { ReattachReplay } from "@/components/mdx/reattach-replay";
import { RenderPathAttrs } from "@/components/mdx/render-path-attrs";
import { RunTally } from "@/components/mdx/run-tally";
import { ScrollColumnsRoundTrip } from "@/components/mdx/scroll-columns-round-trip";
import { ScrollbackBytes } from "@/components/mdx/scrollback-bytes";
import { SendKeysTokens } from "@/components/mdx/send-keys-tokens";
import { ShapingCompare } from "@/components/mdx/shaping-compare";
import { SharedBordersToggle } from "@/components/mdx/shared-borders-toggle";
import { ShrinkRace } from "@/components/mdx/shrink-race";
import { SpentFrames } from "@/components/mdx/spent-frames";
import { StartupPreview } from "@/components/mdx/startup-preview";
import { StyleIdRecycle } from "@/components/mdx/style-id-recycle";
import { TapeTrustFlow } from "@/components/mdx/tape-trust-flow";
import { TerminalCapture } from "@/components/mdx/terminal-capture";
import { TestPurgeStages } from "@/components/mdx/test-purge-stages";
import { ToleranceBlind } from "@/components/mdx/tolerance-blind";
import { WindowTargetOrder } from "@/components/mdx/window-target-order";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Step,
    Steps,
    Mermaid,
    InboxDemo,
    KeybindingExplorer,
    LayoutModes,
    ReviewWalkthrough,
    SessionDiagram,
    BacklogFeel,
    BenchBars,
    DividerCollide,
    RatioDrift,
    ToleranceBlind,
    LineDiscipline,
    ShrinkRace,
    ClusterExplorer,
    RunTally,
    TerminalCapture,
    TapeTrustFlow,
    StartupPreview,
    ShapingCompare,
    DaemonTilePlacement,
    KeycastDemo,
    SharedBordersToggle,
    InvariantBlind,
    LinkLanes,
    CellShape,
    SpentFrames,
    ScrollColumnsRoundTrip,
    ExtentScan,
    RenderPathAttrs,
    AuditChurn,
    HelpKeyDrift,
    PreshapedGuard,
    MediumProbe,
    StyleIdRecycle,
    QueryPath,
    SendKeysTokens,
    ClipWidth,
    PaneBoxNegotiation,
    AgentSourceTimeline,
    MailboxSandbox,
    ReattachReplay,
    ScrollbackBytes,
    WindowTargetOrder,
    HeadlessTerm,
    HardTabHole,
    NegativeControlBench,
    JsonByteLoss,
    BinarySizeWaterfall,
    TestPurgeStages,
    KeptTestBar,
    ...components,
  };
}
