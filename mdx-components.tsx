import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Mermaid } from '@/components/mdx/mermaid';
import { ClusterExplorer } from '@/components/mdx/cluster-explorer';
import { BacklogFeel } from '@/components/mdx/backlog-feel';
import { LineDiscipline } from '@/components/mdx/line-discipline';
import { ShrinkRace } from '@/components/mdx/shrink-race';
import { DividerCollide } from '@/components/mdx/divider-collide';
import { RatioDrift } from '@/components/mdx/ratio-drift';
import { ToleranceBlind } from '@/components/mdx/tolerance-blind';
import { BenchBars } from '@/components/mdx/bench-bars';
import { RunTally } from '@/components/mdx/run-tally';
import { TapeShrink } from '@/components/mdx/tape-shrink';
import { TerminalCapture } from '@/components/mdx/terminal-capture';
import { TapeTrustFlow } from '@/components/mdx/tape-trust-flow';
import { StartupPreview } from '@/components/mdx/startup-preview';
import { ShapingCompare } from '@/components/mdx/shaping-compare';
import { DaemonTilePlacement } from '@/components/mdx/daemon-tile-placement';
import { KeycastDemo } from '@/components/mdx/keycast-demo';
import { SharedBordersToggle } from '@/components/mdx/shared-borders-toggle';
import { InvariantBlind } from '@/components/mdx/invariant-blind';
import { LinkLanes } from '@/components/mdx/link-lanes';
import { CellShape } from '@/components/mdx/cell-shape';
import { SpentFrames } from '@/components/mdx/spent-frames';
import { ScrollColumnsRoundTrip } from '@/components/mdx/scroll-columns-round-trip';
import { ExtentScan } from '@/components/mdx/extent-scan';
import { RenderPathAttrs } from '@/components/mdx/render-path-attrs';
import { AuditChurn } from '@/components/mdx/audit-churn';
import { HelpKeyDrift } from '@/components/mdx/help-key-drift';
import { PreshapedGuard } from '@/components/mdx/preshaped-guard';
import { MediumProbe } from '@/components/mdx/medium-probe';
import { StyleIdRecycle } from '@/components/mdx/style-id-recycle';
import { QueryPath } from '@/components/mdx/query-path';
import { SendKeysTokens } from '@/components/mdx/send-keys-tokens';
import { ClipWidth } from '@/components/mdx/clip-width';
import { PaneBoxNegotiation } from '@/components/mdx/pane-box-negotiation';
import { AgentSourceTimeline } from '@/components/mdx/agent-source-timeline';
import { MailboxSandbox } from '@/components/mdx/mailbox-sandbox';
import { ReattachReplay } from '@/components/mdx/reattach-replay';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Step,
    Steps,
    Mermaid,
    BacklogFeel,
    BenchBars,
    DividerCollide,
    RatioDrift,
    ToleranceBlind,
    LineDiscipline,
    ShrinkRace,
    ClusterExplorer,
    RunTally,
    TapeShrink,
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
    ...components,
  };
}
