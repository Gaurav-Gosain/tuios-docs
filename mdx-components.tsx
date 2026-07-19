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
    ...components,
  };
}
