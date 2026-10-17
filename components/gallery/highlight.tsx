"use client";

import { useEffect, useState } from "react";
import type { GalleryFile } from "@/lib/gallery/feed";

/**
 * A gallery config or theme, highlighted with Shiki in the site's code themes
 * (github-light and github-dark, as the docs code blocks use). The text is the
 * cleaned text from the feed. Shiki only splits it into tokens, and each token
 * is drawn as a React text child with its two colours as CSS variables, so no
 * markup from a comment, or from Shiki, is ever parsed as HTML. The highlighter
 * loads the first time a dialog opens; until then the text shows plain.
 */

type Token = { text: string; light?: string; dark?: string };
type Highlight = (text: string, lang: "toml" | "json") => Token[][];

const COLOR = /^#[0-9a-fA-F]{3,8}$/;

let loading: Promise<Highlight> | null = null;

function loadHighlighter(): Promise<Highlight> {
  loading ??= (async () => {
    const [core, engine, toml, json, light, dark] = await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
      import("shiki/langs/toml.mjs"),
      import("shiki/langs/json.mjs"),
      import("shiki/themes/github-light.mjs"),
      import("shiki/themes/github-dark.mjs"),
    ]);
    const highlighter = await core.createHighlighterCore({
      themes: [light.default, dark.default],
      langs: [toml.default, json.default],
      engine: engine.createJavaScriptRegexEngine(),
    });
    return (text, lang) =>
      highlighter
        .codeToTokensWithThemes(text, {
          lang,
          themes: { light: "github-light", dark: "github-dark" },
        })
        .map((line) =>
          line.map((t) => ({
            text: t.content,
            light: t.variants.light?.color,
            dark: t.variants.dark?.color,
          })),
        );
  })();
  return loading;
}

/** The Shiki language of a file: JSON for a theme, TOML for anything else. */
function langOf(file: GalleryFile): "toml" | "json" {
  return file.label === "json" || file.label === "theme" ? "json" : "toml";
}

export function HighlightedCode({ file }: { file: GalleryFile }) {
  const [lines, setLines] = useState<Token[][] | null>(null);

  useEffect(() => {
    let live = true;
    setLines(null);
    loadHighlighter()
      .then((highlight) => {
        if (live) setLines(highlight(file.text, langOf(file)));
      })
      // Offline or a failed chunk: the plain text stays.
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [file]);

  return (
    <pre className="shiki not-prose overflow-x-auto px-4 pb-4 font-mono text-[13px] leading-relaxed">
      <code>
        {lines
          ? lines.map((line, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: lines have no identity but their place
              <span key={i} className="line">
                {line.map((t, j) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: as above
                    key={j}
                    style={
                      {
                        "--shiki-light":
                          t.light && COLOR.test(t.light) ? t.light : undefined,
                        "--shiki-dark":
                          t.dark && COLOR.test(t.dark) ? t.dark : undefined,
                      } as React.CSSProperties
                    }
                  >
                    {t.text}
                  </span>
                ))}
                {i < lines.length - 1 ? "\n" : null}
              </span>
            ))
          : file.text}
      </code>
    </pre>
  );
}
