"use client";

/**
 * The client widgets of posts, docs and release notes, each in its own chunk.
 * mdx-components.tsx registers every widget for every page. Imported
 * directly, all of them went into one chunk that every post and docs page
 * downloaded, about 96 KB gzipped, whether it used any or not. Through
 * next/dynamic a page loads only the widgets it renders. They still render
 * on the server, so the HTML is the same.
 *
 * Mermaid is left out. It already loads mermaid with a dynamic import, and
 * behind next/dynamic the build split that into chunks twice the size.
 */
import dynamic from "next/dynamic";

export const InboxDemo = dynamic(() =>
  import("../docs/inbox-demo").then((m) => m.InboxDemo),
);
export const KeybindingExplorer = dynamic(() =>
  import("../docs/keybinding-explorer").then((m) => m.KeybindingExplorer),
);
export const LayoutModes = dynamic(() =>
  import("../docs/layout-modes").then((m) => m.LayoutModes),
);
export const ReviewWalkthrough = dynamic(() =>
  import("../docs/review-walkthrough").then((m) => m.ReviewWalkthrough),
);
export const SessionDiagram = dynamic(() =>
  import("../docs/session-diagram").then((m) => m.SessionDiagram),
);
export const AgentSourceTimeline = dynamic(() =>
  import("./agent-source-timeline").then((m) => m.AgentSourceTimeline),
);
export const AuditChurn = dynamic(() =>
  import("./audit-churn").then((m) => m.AuditChurn),
);
export const BacklogFeel = dynamic(() =>
  import("./backlog-feel").then((m) => m.BacklogFeel),
);
export const BinarySizeWaterfall = dynamic(() =>
  import("./binary-size-waterfall").then((m) => m.BinarySizeWaterfall),
);
export const CellShape = dynamic(() =>
  import("./cell-shape").then((m) => m.CellShape),
);
export const ClipWidth = dynamic(() =>
  import("./clip-width").then((m) => m.ClipWidth),
);
export const ClusterExplorer = dynamic(() =>
  import("./cluster-explorer").then((m) => m.ClusterExplorer),
);
export const DaemonTilePlacement = dynamic(() =>
  import("./daemon-tile-placement").then((m) => m.DaemonTilePlacement),
);
export const DividerCollide = dynamic(() =>
  import("./divider-collide").then((m) => m.DividerCollide),
);
export const ExtentScan = dynamic(() =>
  import("./extent-scan").then((m) => m.ExtentScan),
);
export const HardTabHole = dynamic(() =>
  import("./hard-tab-hole").then((m) => m.HardTabHole),
);
export const HeadlessTerm = dynamic(() =>
  import("./headless-term").then((m) => m.HeadlessTerm),
);
export const HelpKeyDrift = dynamic(() =>
  import("./help-key-drift").then((m) => m.HelpKeyDrift),
);
export const InvariantBlind = dynamic(() =>
  import("./invariant-blind").then((m) => m.InvariantBlind),
);
export const JsonByteLoss = dynamic(() =>
  import("./json-byte-loss").then((m) => m.JsonByteLoss),
);
export const KeptTestBar = dynamic(() =>
  import("./kept-test-bar").then((m) => m.KeptTestBar),
);
export const KeycastDemo = dynamic(() =>
  import("./keycast-demo").then((m) => m.KeycastDemo),
);
export const LineDiscipline = dynamic(() =>
  import("./line-discipline").then((m) => m.LineDiscipline),
);
export const LinkLanes = dynamic(() =>
  import("./link-lanes").then((m) => m.LinkLanes),
);
export const MailboxSandbox = dynamic(() =>
  import("./mailbox-sandbox").then((m) => m.MailboxSandbox),
);
export const MediumProbe = dynamic(() =>
  import("./medium-probe").then((m) => m.MediumProbe),
);
export const NegativeControlBench = dynamic(() =>
  import("./negative-control-bench").then((m) => m.NegativeControlBench),
);
export const PaneBoxNegotiation = dynamic(() =>
  import("./pane-box-negotiation").then((m) => m.PaneBoxNegotiation),
);
export const PreshapedGuard = dynamic(() =>
  import("./preshaped-guard").then((m) => m.PreshapedGuard),
);
export const QueryPath = dynamic(() =>
  import("./query-path").then((m) => m.QueryPath),
);
export const RatioDrift = dynamic(() =>
  import("./ratio-drift").then((m) => m.RatioDrift),
);
export const ReattachReplay = dynamic(() =>
  import("./reattach-replay").then((m) => m.ReattachReplay),
);
export const ReleaseClip = dynamic(() =>
  import("./release-clip").then((m) => m.ReleaseClip),
);
export const RenderPathAttrs = dynamic(() =>
  import("./render-path-attrs").then((m) => m.RenderPathAttrs),
);
export const ScrollColumnsRoundTrip = dynamic(() =>
  import("./scroll-columns-round-trip").then((m) => m.ScrollColumnsRoundTrip),
);
export const ScrollbackBytes = dynamic(() =>
  import("./scrollback-bytes").then((m) => m.ScrollbackBytes),
);
export const SendKeysTokens = dynamic(() =>
  import("./send-keys-tokens").then((m) => m.SendKeysTokens),
);
export const ShapingCompare = dynamic(() =>
  import("./shaping-compare").then((m) => m.ShapingCompare),
);
export const SharedBordersToggle = dynamic(() =>
  import("./shared-borders-toggle").then((m) => m.SharedBordersToggle),
);
export const ShrinkRace = dynamic(() =>
  import("./shrink-race").then((m) => m.ShrinkRace),
);
export const SpentFrames = dynamic(() =>
  import("./spent-frames").then((m) => m.SpentFrames),
);
export const StartupPreview = dynamic(() =>
  import("./startup-preview").then((m) => m.StartupPreview),
);
export const StyleIdRecycle = dynamic(() =>
  import("./style-id-recycle").then((m) => m.StyleIdRecycle),
);
export const TapeTrustFlow = dynamic(() =>
  import("./tape-trust-flow").then((m) => m.TapeTrustFlow),
);
export const TestPurgeStages = dynamic(() =>
  import("./test-purge-stages").then((m) => m.TestPurgeStages),
);
export const ToleranceBlind = dynamic(() =>
  import("./tolerance-blind").then((m) => m.ToleranceBlind),
);
export const WindowTargetOrder = dynamic(() =>
  import("./window-target-order").then((m) => m.WindowTargetOrder),
);
