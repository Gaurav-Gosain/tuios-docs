"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * /learn is dark unless the reader picked the light theme themselves. The
 * terminal is dark, and the page around it looks best matching. The class
 * scopes the dark tokens to this subtree, so the rest of the site keeps
 * following the system setting.
 */
export function LearnTheme({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const light = mounted && theme === "light";
  return (
    <div
      className={`learn-root flex min-h-screen flex-1 flex-col ${light ? "" : "dark"}`}
    >
      {children}
    </div>
  );
}
