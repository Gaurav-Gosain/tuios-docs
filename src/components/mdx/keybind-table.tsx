"use client";

import type { ReactNode } from "react";

interface KeybindItemProps {
  keys: ReactNode;
  action: string;
}

function KeybindItem({ keys, action }: KeybindItemProps) {
  return (
    <div className="flex items-start gap-4 py-2 px-3 rounded-lg hover:bg-fd-accent/30 transition-colors">
      <div className="flex items-center gap-1 min-w-fit shrink-0">{keys}</div>
      <div className="text-fd-muted-foreground flex-1">{action}</div>
    </div>
  );
}

interface KeybindListProps {
  children: ReactNode;
}

export function KeybindList({ children }: KeybindListProps) {
  return (
    <div className="my-6 space-y-1 rounded-lg border border-fd-border bg-fd-card/30 p-2">
      {children}
    </div>
  );
}

KeybindList.Item = KeybindItem;

// Helper component for key combinations
interface KeyProps {
  children: string;
}

export function Key({ children }: KeyProps) {
  return <kbd>{children}</kbd>;
}

// Helper for key sequences (with space between)
interface KeySeqProps {
  keys: string[];
}

export function KeySeq({ keys }: KeySeqProps) {
  return (
    <>
      {keys.map((key, i) => (
        <span key={i}>
          <kbd>{key}</kbd>
          {i < keys.length - 1 && " "}
        </span>
      ))}
    </>
  );
}

// Helper for key combinations (with + between)
interface KeyComboProps {
  keys: string[];
}

export function KeyCombo({ keys }: KeyComboProps) {
  return (
    <>
      {keys.map((key, i) => (
        <span key={i}>
          <kbd>{key}</kbd>
          {i < keys.length - 1 && "+"}
        </span>
      ))}
    </>
  );
}
