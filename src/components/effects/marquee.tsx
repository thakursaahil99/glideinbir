import { clsx } from "clsx";
import type { ReactNode } from "react";

// Endless horizontal ticker. Pure CSS (see .marquee-track in globals.css):
// the items render twice and the track slides by exactly half its width.
export function Marquee({ items, className }: { items: ReactNode[]; className?: string }) {
  const row = (hidden: boolean) =>
    items.map((item, i) => (
      <span key={`${hidden}-${i}`} aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
        {item}
      </span>
    ));

  return (
    <div className={clsx("marquee overflow-hidden", className)}>
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
