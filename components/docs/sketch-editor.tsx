"use client";

/**
 * The text editor of the sketch playground: CodeMirror 6 with a small
 * Mermaid mode, in the docs theme's colours. It marks the line of the last
 * error. Loaded in its own chunk by the playground.
 */
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import {
  HighlightStyle,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language";
import {
  EditorState,
  type Extension,
  StateEffect,
  StateField,
} from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  drawSelection,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { useEffect, useRef } from "react";
import { mermaidLanguage } from "@/lib/sketch/mermaid-language";

const setErrorLine = StateEffect.define<number>();

const errorLine = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    let next = deco.map(tr.changes);
    for (const e of tr.effects) {
      if (!e.is(setErrorLine)) continue;
      const n = e.value;
      if (n < 1) {
        next = Decoration.none;
      } else {
        // An error at the end of the text names the line after the last.
        const line = tr.state.doc.line(Math.min(n, tr.state.doc.lines));
        next = Decoration.set([
          Decoration.line({ class: "cm-sketch-error" }).range(line.from),
        ]);
      }
    }
    return next;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const highlight = HighlightStyle.define([
  { tag: tags.keyword, color: "var(--color-fd-primary)", fontWeight: "600" },
  {
    tag: tags.comment,
    color: "var(--color-fd-muted-foreground)",
    fontStyle: "italic",
  },
  { tag: tags.string, color: "var(--sketch-string)" },
  { tag: tags.operator, color: "var(--sketch-operator)" },
  { tag: tags.number, color: "var(--sketch-number)" },
  { tag: tags.bracket, color: "var(--color-fd-muted-foreground)" },
]);

const theme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "13.5px",
    backgroundColor: "transparent",
    color: "var(--color-fd-foreground)",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    fontFamily: "var(--font-mono)",
    lineHeight: "1.65",
    overscrollBehavior: "contain",
  },
  ".cm-content": { padding: "12px 0", caretColor: "var(--color-fd-primary)" },
  ".cm-line": { padding: "0 14px 0 6px" },
  ".cm-gutters": {
    backgroundColor: "transparent",
    color: "var(--color-fd-muted-foreground)",
    border: "none",
    opacity: "0.7",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 4px 0 12px",
    minWidth: "32px",
  },
  ".cm-activeLine": {
    backgroundColor:
      "color-mix(in oklab, var(--color-fd-accent) 55%, transparent)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
    color: "var(--color-fd-foreground)",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--color-fd-primary)",
    borderLeftWidth: "2px",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection":
    {
      backgroundColor:
        "color-mix(in oklab, var(--color-fd-primary) 22%, transparent) !important",
    },
  ".cm-sketch-error": {
    backgroundColor:
      "color-mix(in oklab, var(--color-fd-error, #e5484d) 14%, transparent)",
    boxShadow: "inset 2px 0 0 var(--color-fd-error, #e5484d)",
  },
});

export type SketchEditorProps = {
  /** The text. A change from outside, such as an example, replaces the text. */
  value: string;
  onChange: (text: string) => void;
  /** The line to mark, from 1, or 0 for none. */
  errorAt: number;
  label: string;
};

export function SketchEditor({
  value,
  onChange,
  errorAt,
  label,
}: SketchEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const changed = useRef(onChange);
  changed.current = onChange;

  // biome-ignore lint/correctness/useExhaustiveDependencies: the editor is made once; value updates go through the effect below.
  useEffect(() => {
    if (!host.current) return;
    const extensions: Extension[] = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      drawSelection(),
      history(),
      indentUnit.of("  "),
      EditorState.tabSize.of(2),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      mermaidLanguage,
      syntaxHighlighting(highlight),
      errorLine,
      theme,
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({
        "aria-label": label,
        spellcheck: "false",
        autocapitalize: "off",
        autocorrect: "off",
      }),
      EditorView.updateListener.of((u) => {
        if (u.docChanged) changed.current(u.state.doc.toString());
      }),
    ];
    const v = new EditorView({
      parent: host.current,
      state: EditorState.create({ doc: value, extensions }),
    });
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
  }, []);

  useEffect(() => {
    const v = view.current;
    if (!v) return;
    const now = v.state.doc.toString();
    if (now !== value) {
      v.dispatch({ changes: { from: 0, to: now.length, insert: value } });
    }
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({ effects: setErrorLine.of(errorAt) });
  }, [errorAt]);

  return <div ref={host} className="h-full min-h-0 overflow-hidden" />;
}
