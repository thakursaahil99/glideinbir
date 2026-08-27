import { ArrowUpRight } from "lucide-react";

// A small circular arrow button that reveals on hover — drop inside any
// `relative` container whose ancestor `<Link>`/wrapper has `group` set.
// Matches the hover-affordance pattern used on every card across the
// reference site's section grids.
export function CardArrow() {
  return (
    <span className="pointer-events-none absolute right-3 top-3 z-10 flex h-9 w-9 -translate-y-1 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow-sm backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:bg-brand group-hover:text-white group-hover:opacity-100">
      <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
    </span>
  );
}
