"use client";
import { cva } from "class-variance-authority";
import { Airplay, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { applyTheme, OPEN_EVENT, writeStored } from "@/lib/site-themes/store";
import { useAppliedTheme } from "./use-applied";

const item = cva("size-6.5 rounded-full p-1.5", {
  variants: {
    active: {
      true: "bg-fd-accent text-fd-accent-foreground",
      false: "text-fd-muted-foreground hover:text-fd-accent-foreground",
    },
  },
});

const modes = [
  ["light", Sun, "Light"],
  ["dark", Moon, "Dark"],
  ["system", Airplay, "System"],
] as const;

/**
 * The theme control in the header and the docs sidebar: the light, dark and
 * system modes of the site, and a button that opens the tuios theme picker.
 * A mode button also takes off a tuios theme, so it is the way back to the
 * default.
 */
export function ThemeSwitch({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const applied = useAppliedTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pick = (mode: string) => {
    if (applied) {
      const dark =
        mode === "dark" ||
        (mode === "system" &&
          matchMedia("(prefers-color-scheme: dark)").matches);
      writeStored(null);
      applyTheme(null, dark);
    }
    setTheme(mode);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border p-1",
        className,
      )}
      data-theme-toggle=""
    >
      {modes.map(([key, Icon, label]) => (
        <button
          type="button"
          key={key}
          aria-label={label}
          aria-pressed={mounted ? !applied && theme === key : undefined}
          className={item({ active: mounted && !applied && theme === key })}
          onClick={() => pick(key)}
        >
          <Icon className="size-full" fill="currentColor" />
        </button>
      ))}
      <button
        type="button"
        aria-label="Themes"
        aria-haspopup="dialog"
        title="Themes"
        className={item({ active: mounted && !!applied })}
        onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      >
        <Palette className="size-full" />
      </button>
    </div>
  );
}
