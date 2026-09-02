import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("rounded-2xl border border-border bg-paper shadow-sm", className)}
      {...props}
    />
  );
}

type BadgeTone = "neutral" | "brand" | "success" | "danger" | "info" | "purple" | "amber";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-surface text-muted",
  brand: "bg-brand/10 text-brand-dark",
  success: "bg-emerald-50 text-emerald-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-sky-50 text-sky-700",
  purple: "bg-violet-50 text-violet-700",
  amber: "bg-amber-50 text-amber-700",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("mx-auto w-full max-w-6xl px-6", className)} {...props} />;
}
