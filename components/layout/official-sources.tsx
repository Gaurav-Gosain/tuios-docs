import { cn } from "@/lib/cn";

const linkClass =
  "underline decoration-fd-muted-foreground/50 underline-offset-2 transition-colors hover:text-fd-primary";

/**
 * The note that names the project's only official homes. An account on X
 * impersonated tuios, so every page carries this line.
 */
export function OfficialSources({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-fd-muted-foreground text-xs leading-relaxed",
        className,
      )}
    >
      tuios lives only at{" "}
      <a href="https://tuios.dev" className={linkClass}>
        tuios.dev
      </a>{" "}
      and{" "}
      <a
        href="https://github.com/Gaurav-Gosain/tuios"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        github.com/Gaurav-Gosain/tuios
      </a>
      . tuios has no X or Twitter account. An account that offers a tuios token
      or presale is not this project.
    </p>
  );
}
