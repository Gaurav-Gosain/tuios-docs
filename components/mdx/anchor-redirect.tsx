"use client";

import { useEffect } from "react";

/**
 * On the index page of a split reference (/docs/cli-reference and others), a
 * link with an anchor that moved to a part, such as
 * /docs/cli-reference#tuios-run, goes on to the part that holds it.
 * lib/reference/anchors.json, written by scripts/reference-docs.mjs, maps each
 * moved anchor to its part. The map loads only when the anchor is not on the
 * page.
 */
export function AnchorRedirect({ page }: { page: string }) {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id || document.getElementById(id)) return;
    import("@/lib/reference/anchors.json").then((mod) => {
      const moved = (mod.default as Record<string, Record<string, string>>)[
        page
      ];
      const to = moved?.[id];
      if (to) window.location.replace(`${to}#${encodeURIComponent(id)}`);
    });
  }, [page]);
  return null;
}
