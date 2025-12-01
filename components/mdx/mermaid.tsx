"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";

export function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          fontFamily: "inherit",
          themeCSS: "margin: 1.5rem auto 0;",
          theme: resolvedTheme === "dark" ? "dark" : "default",
        });

        const result = await mermaid.render(
          id.replace(/:/g, "_"),
          chart.replaceAll("\\n", "\n")
        );

        if (!cancelled) {
          setSvg(result.svg);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to render diagram");
        }
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [chart, id, resolvedTheme]);

  if (error) {
    return (
      <div className="p-4 border border-red-500 rounded bg-red-500/10 text-red-500">
        Failed to render mermaid diagram: {error}
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="p-4 border border-fd-border rounded bg-fd-muted animate-pulse">
        Loading diagram...
      </div>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
