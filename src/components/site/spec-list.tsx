import { Check, X, Info, type LucideIcon } from "lucide-react";

type Variant = "includes" | "excludes" | "requirements";

const VARIANTS: Record<Variant, { icon: LucideIcon; color: string }> = {
  includes: { icon: Check, color: "text-emerald-600" },
  excludes: { icon: X, color: "text-red-500" },
  requirements: { icon: Info, color: "text-brand" },
};

export function SpecList({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: Variant;
}) {
  if (items.length === 0) return null;
  const { icon: Icon, color } = VARIANTS[variant];

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} strokeWidth={2.5} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
