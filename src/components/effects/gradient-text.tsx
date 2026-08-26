import { clsx } from "clsx";
import type { ReactNode } from "react";

export function GradientText({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={clsx("gradient-text font-semibold", className)}>{children}</span>;
}
