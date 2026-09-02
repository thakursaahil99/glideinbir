import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { MODULE_THEME, type ModuleKey } from "@/lib/module-theme";

// Big bold "eyebrow pill + oversized heading" section header, used
// throughout the site (reference: bobbysingh.vercel.app's section pattern,
// adapted to our light theme). Pass a highlighted word/phrase in `title` as
// a <span className="text-brand"> — same convention GradientText usage
// already follows elsewhere. `tone` colors the eyebrow pill per module
// (paragliding/school/hotels/...) instead of every section on the site
// using the same brand orange.
export function SectionHeader({
  eyebrow,
  icon: Icon,
  title,
  description,
  align = "left",
  tone = "overview",
}: {
  eyebrow: string;
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: ModuleKey;
}) {
  const centered = align === "center";
  const theme = MODULE_THEME[tone];
  return (
    <div className={centered ? "text-center" : ""}>
      <span
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-widest",
          theme.soft,
          theme.text,
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />}
        {eyebrow}
      </span>
      <h2
        className={clsx(
          "mt-4 text-3xl font-bold tracking-tight md:text-5xl",
          centered && "mx-auto max-w-2xl",
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={clsx("mt-4 text-lg text-muted", centered ? "mx-auto max-w-xl" : "max-w-xl")}>
          {description}
        </p>
      )}
    </div>
  );
}
