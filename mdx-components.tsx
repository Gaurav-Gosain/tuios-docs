import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Mermaid } from '@/components/mdx/mermaid';
import { BacklogChart } from '@/components/mdx/backlog-chart';
import { BenchBars } from '@/components/mdx/bench-bars';
import { RunTally } from '@/components/mdx/run-tally';
import { ShrinkTrace } from '@/components/mdx/shrink-trace';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Step,
    Steps,
    Mermaid,
    BacklogChart,
    BenchBars,
    RunTally,
    ShrinkTrace,
    ...components,
  };
}
