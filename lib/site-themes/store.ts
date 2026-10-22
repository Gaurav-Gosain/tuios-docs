/**
 * Where the chosen theme lives in the browser, and how it is put on the page.
 *
 * The choice is saved as the finished style sheet, not only the theme id. The
 * script in app/layout.tsx copies it into the head before the first paint, so
 * a page never shows the default colours first and the theme data never loads
 * just to show a saved theme. The light or dark base goes to next-themes, which
 * sets the `dark` class the same way it always has.
 */

export const STORAGE_KEY = "tuios-site-theme";
export const STYLE_ID = "tt-style";
/** Sent on window when the applied theme changes. */
export const CHANGE_EVENT = "tuios:theme-change";
/** Sent on window to open the theme picker from anywhere. */
export const OPEN_EVENT = "tuios:themes";

export type StoredTheme = {
  id: string;
  name: string;
  dark: boolean;
  css: string;
  /** The next-themes value before a theme was chosen, to go back to. */
  prev?: string;
};

export function readStored(): StoredTheme | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const t = JSON.parse(raw) as StoredTheme;
    return t && typeof t.css === "string" && typeof t.id === "string"
      ? t
      : null;
  } catch {
    return null;
  }
}

export function writeStored(t: StoredTheme | null) {
  try {
    if (t) localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be off (a private window, blocked site data). The theme
    // still applies to this page; it is just not remembered.
  }
}

/** The id of the theme on the page now, or null for the site default. */
export function appliedId(): string | null {
  if (typeof document === "undefined") return null;
  return document.documentElement.getAttribute("data-tt");
}

/**
 * Puts a theme on the page, or takes it off when css is null. `dark` sets the
 * class Tailwind's dark variant and the code blocks follow; pass the
 * next-themes resolved value when going back to the default.
 */
export function applyTheme(
  theme: { id: string; css: string } | null,
  dark: boolean,
) {
  const root = document.documentElement;
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (theme) {
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    if (style.textContent !== theme.css) style.textContent = theme.css;
    root.setAttribute("data-tt", theme.id);
  } else {
    style?.remove();
    root.removeAttribute("data-tt");
  }
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark);
  root.style.colorScheme = dark ? "dark" : "light";
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * The script that runs in the head before the page draws. It must stay small
 * and must not throw: a broken saved value means the default colours.
 */
export const BOOT_SCRIPT = `try{var t=JSON.parse(localStorage.getItem(${JSON.stringify(
  STORAGE_KEY,
)}));if(t&&typeof t.css=="string"){var s=document.createElement("style");s.id=${JSON.stringify(
  STYLE_ID,
)};s.textContent=t.css;document.head.appendChild(s);document.documentElement.setAttribute("data-tt",t.id)}}catch(e){}`;

/**
 * The theme of the day: the same for every visitor on a given date (UTC), and
 * a different one each day.
 */
export function dayIndex(count: number, date = new Date()): number {
  const key = date.toISOString().slice(0, 10);
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % count;
}
