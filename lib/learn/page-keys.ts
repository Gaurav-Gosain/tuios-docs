/**
 * Whether the /learn hub may take a key for itself, such as 1 to 9 for a
 * track, with `active` as the focused element.
 *
 * Keys typed into a field or the terminal (its input is a textarea) are not
 * the page's. Neither are keys on a live terminal's stage, which a click can
 * focus, unless the reader left the terminal with esc three times: that sets
 * `data-left-by-keys` on the stage until it loses focus.
 */
export function pageKeysAllowed(active: Element | null): boolean {
  if (!active) return true;
  if (active.closest("input, textarea, [contenteditable]")) return false;
  const stage = active.closest("[role=application]");
  if (!stage) return true;
  return stage === active && stage.hasAttribute("data-left-by-keys");
}
