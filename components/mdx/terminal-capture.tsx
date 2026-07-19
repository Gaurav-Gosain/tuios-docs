import { cn } from '@/lib/cn';

type Tone = 'normal' | 'echo' | 'dim';

export interface CaptureLine {
  text: string;
  /**
   * `echo` marks bytes the terminal produced rather than the program: line
   * discipline echo, query replies, anything the program under test did not
   * write. Distinguishing them is the whole point of showing a capture.
   */
  tone?: Tone;
}

export interface TerminalCaptureProps {
  title: string;
  lines: CaptureLine[];
  note?: string;
  /** Pads to this many rows so a two-line capture still reads as a screen. */
  rows?: number;
}

const TONE: Record<Tone, string> = {
  normal: 'text-fd-foreground',
  echo: 'text-fd-primary',
  dim: 'text-fd-muted-foreground',
};

/**
 * A captured terminal screen, rendered as a screen rather than as a code block.
 * A code block says "here is some text". This says "here is what was on the
 * terminal", which for a harness that captures screens is the actual claim.
 */
export function TerminalCapture({
  title,
  lines,
  note,
  rows = 4,
}: TerminalCaptureProps) {
  const padding = Math.max(0, rows - lines.length);

  return (
    <figure className="not-prose my-8">
      <div className="overflow-hidden rounded-lg border border-fd-border bg-fd-card">
        <div className="flex items-center gap-2 border-b border-fd-border bg-fd-muted/40 px-3 py-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-fd-muted-foreground/35" />
            <span className="size-2.5 rounded-full bg-fd-muted-foreground/35" />
            <span className="size-2.5 rounded-full bg-fd-muted-foreground/35" />
          </span>
          <span className="font-mono text-xs text-fd-muted-foreground">
            {title}
          </span>
        </div>

        <div className="overflow-x-auto">
          <pre className="min-w-max px-4 py-3 font-mono text-sm leading-6">
            {lines.map((line, i) => (
              <div key={i} className={cn(TONE[line.tone ?? 'normal'])}>
                {line.text || ' '}
              </div>
            ))}
            {Array.from({ length: padding }, (_, i) => (
              <div key={`pad-${i}`}>&nbsp;</div>
            ))}
          </pre>
        </div>
      </div>

      {note ? (
        <figcaption className="mt-3 text-sm text-fd-muted-foreground">
          {note}
        </figcaption>
      ) : null}
    </figure>
  );
}
