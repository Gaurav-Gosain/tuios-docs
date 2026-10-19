/**
 * The /in-the-wild feed: the mentions of tuios the maintainer featured, as a
 * hearsay feed (version 1). The tracker writes it on the maintainer's
 * machine and scripts/upload-in-the-wild.sh puts it in the MEDIA bucket at
 * mentions/featured.json. Nothing else writes that key.
 *
 * The URL has no file extension for the reason gallery.ts gives:
 * wrangler.jsonc keeps every .json path away from the Worker.
 *
 *   /in-the-wild/feed  ->  mentions/featured.json
 *
 * It is cached for five minutes, like the gallery feed, so an item taken off
 * the list goes away soon.
 */

import type { GalleryObject } from "./gallery";

export function wildObject(pathname: string): GalleryObject | null {
  if (pathname !== "/in-the-wild/feed") return null;
  return {
    key: "mentions/featured.json",
    type: "application/json; charset=utf-8",
    cache: "public, max-age=300",
  };
}
