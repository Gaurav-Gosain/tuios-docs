import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Mermaid } from '@/components/mdx/mermaid';
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
    BenchBars,
    RunTally,
    TapeShrink,
    TerminalCapture,
    ...components,
  };
}
