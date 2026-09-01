import { Star } from "lucide-react";
import { reviewService } from "@/server/modules/review/service";
import { formatDate } from "@/lib/format";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={i < rating ? "h-4 w-4 fill-brand text-brand" : "h-4 w-4 text-border"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export async function ReviewsSection({
  targetType,
  targetId,
}: {
  targetType: "PARAGLIDING" | "SCHOOL" | "HOTEL";
  targetId: string;
}) {
  const { reviews, average, count } = await reviewService.listApproved(targetType, targetId);

  if (count === 0) return null;

  return (
    <div className="mt-10 border-t border-border pt-8">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Reviews</h2>
        {average !== null && (
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <Stars rating={Math.round(average)} />
            <span className="font-medium text-ink">{average.toFixed(1)}</span>
            <span>
              ({count} review{count === 1 ? "" : "s"})
            </span>
          </div>
        )}
      </div>
      <div className="mt-5 space-y-5">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-border pb-5 last:border-0 last:pb-0">
            <div className="flex items-center justify-between">
              <p className="font-medium">{review.user.name}</p>
              <p className="text-xs text-muted">{formatDate(review.createdAt)}</p>
            </div>
            <div className="mt-1">
              <Stars rating={review.rating} />
            </div>
            {review.comment && <p className="mt-2 text-sm text-ink/90">{review.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
