import type { InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

export function AuthInput({
  label,
  icon: Icon,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; icon: LucideIcon }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="relative mt-1">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          {...props}
          className="w-full rounded-lg border border-border py-2 pl-10 pr-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>
    </div>
  );
}
