import { Banner } from "fumadocs-ui/components/banner";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";

/**
 * A temporary warning on every page: an account on X impersonates tuios.
 * Remove this component and its one use in app/layout.tsx when X suspends the
 * account. The quieter note in official-sources.tsx stays.
 *
 * The id carries a version. A reader who closes the banner does not see it
 * again, so a new warning needs a new id.
 *
 * A phone leaves out the middle sentence, so the banner stays on two lines.
 *
 * The height is fixed per breakpoint (--impersonation-banner-height in
 * global.css), so the page does not move when the banner loads or closes.
 */
export function ImpersonationBanner() {
  return (
    <Banner
      id="x-impersonation-v1"
      height="var(--impersonation-banner-height)"
      className="impersonation-banner ps-3 pe-10 font-normal text-xs leading-snug sm:text-sm"
    >
      <p className="flex items-center gap-2 text-balance">
        <TriangleAlert
          aria-hidden
          className="impersonation-banner-icon size-4 shrink-0 max-sm:hidden"
        />
        <span>
          <strong className="font-semibold">
            An account on X called @tuiosdev is pretending to be tuios.
          </strong>{" "}
          {/* Left out on a phone to keep the banner to two lines. */}
          <span className="max-sm:hidden">It is not this project. </span>
          tuios has no X account and no token.{" "}
          <Link
            href="/docs#community"
            className="whitespace-nowrap font-medium underline underline-offset-2"
          >
            Learn more
          </Link>
        </span>
      </p>
    </Banner>
  );
}
