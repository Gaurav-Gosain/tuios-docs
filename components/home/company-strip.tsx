import { companies } from "@/lib/companies";

/**
 * The row of companies under the hero's buttons. Logos are one path filled with
 * currentColor, so every site theme, light or dark, colours them.
 */
export function CompanyStrip() {
  return (
    <section
      aria-labelledby="company-strip-title"
      className="fade-up mx-auto w-full max-w-5xl px-4 pt-12 [animation-delay:260ms] md:px-6 md:pt-14"
    >
      <p
        id="company-strip-title"
        className="text-center font-mono text-fd-muted-foreground text-sm"
      >
        Loved by engineers at
      </p>
      <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
        {companies.map((company) => (
          <li
            key={company.name}
            className="flex items-center gap-2 text-fd-muted-foreground transition-colors hover:text-fd-foreground"
          >
            <svg
              viewBox={company.viewBox ?? "0 0 24 24"}
              aria-hidden="true"
              className="size-5 shrink-0 fill-current"
            >
              <path
                d={company.path}
                fillRule={company.evenOdd ? "evenodd" : undefined}
              />
            </svg>
            <span className="font-medium text-sm">{company.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
