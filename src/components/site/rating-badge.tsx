import { Star } from "lucide-react";

export function RatingBadge({ average, count }: { average: number; count: number }) {
  if (count === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-ink">
      <Star className="h-3.5 w-3.5 fill-brand text-brand" strokeWidth={1.5} />
      {average.toFixed(1)}
      <span className="font-normal text-muted">({count})</span>
    </span>
  );
}
