"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { clsx } from "clsx";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ExistingReview = { rating: number; comment: string | null; status: string };

export function LeaveReviewForm({
  bookingId,
  targetType,
  title,
  existingReview,
}: {
  bookingId: string;
  targetType: "PARAGLIDING" | "SCHOOL" | "HOTEL";
  title: string;
  existingReview?: ExistingReview;
}) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [submitted, setSubmitted] = useState(Boolean(existingReview));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (submitted) {
    return (
      <Card className="p-5">
        <p className="text-sm font-medium">Your review of {title}</p>
        <div className="mt-1 flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={i < rating ? "h-4 w-4 fill-brand text-brand" : "h-4 w-4 text-border"}
              strokeWidth={1.5}
            />
          ))}
        </div>
        {comment && <p className="mt-2 text-sm text-muted">{comment}</p>}
        <p className="mt-2 text-xs text-muted">Thanks — it&apos;ll show once approved.</p>
      </Card>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please pick a star rating.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, targetType, rating, comment: comment.trim() || undefined }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Could not submit your review.");
        return;
      }
      setSubmitted(true);
    });
  }

  return (
    <Card className="p-5">
      <p className="text-sm font-medium">Rate {title}</p>
      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
          {Array.from({ length: 5 }, (_, i) => {
            const value = i + 1;
            const active = value <= (hoverRating || rating);
            return (
              <button
                key={value}
                type="button"
                onMouseEnter={() => setHoverRating(value)}
                onClick={() => setRating(value)}
                className="p-0.5"
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
              >
                <Star
                  className={clsx("h-6 w-6 transition-colors", active ? "fill-brand text-brand" : "text-border")}
                  strokeWidth={1.5}
                />
              </button>
            );
          })}
        </div>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How was it? (optional)"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Submitting…" : "Submit review"}
        </Button>
      </form>
    </Card>
  );
}
