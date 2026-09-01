"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, Badge } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  status: "PENDING" | "APPROVED" | "HIDDEN";
  targetType: "PARAGLIDING" | "SCHOOL" | "HOTEL";
  createdAt: string;
  user: { name: string; email: string };
  paraglidingPackage: { title: string } | null;
  schoolCourse: { title: string } | null;
  hotel: { name: string } | null;
};

const FILTERS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "HIDDEN", label: "Hidden" },
] as const;

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-green-50 text-green-700",
  HIDDEN: "bg-red-50 text-red-700",
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("");
  const [isPending, startTransition] = useTransition();

  function load() {
    const qs = filter ? `?status=${filter}` : "";
    fetch(`/api/admin/reviews${qs}`)
      .then((res) => res.json())
      .then((body) => setReviews(body.success ? body.data : []));
  }

  useEffect(load, [filter]);

  function moderate(id: string, status: "APPROVED" | "HIDDEN") {
    startTransition(async () => {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      load();
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this review? You can restore it later from Deleted data (Super Admin only).")) return;
    startTransition(async () => {
      await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      load();
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
      <p className="mt-1 text-sm text-muted">
        New reviews start Pending — approve to show them on the site, or hide/delete anything
        inappropriate.
      </p>

      <div className="mt-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={
              filter === f.value
                ? "rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white"
                : "rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted hover:text-ink"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {reviews?.map((review) => {
          const target = review.paraglidingPackage?.title ?? review.schoolCourse?.title ?? review.hotel?.name;
          return (
            <Card key={review.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{review.user.name}</p>
                    <Badge>{"★".repeat(review.rating)}</Badge>
                    <Badge className={STATUS_BADGE[review.status]}>{review.status}</Badge>
                  </div>
                  <p className="text-sm text-muted">
                    {review.targetType} · {target ?? "—"} · {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
              {review.comment && <p className="mt-3 text-sm">{review.comment}</p>}
              <div className="mt-4 flex gap-2">
                {review.status !== "APPROVED" && (
                  <button
                    type="button"
                    onClick={() => moderate(review.id, "APPROVED")}
                    disabled={isPending}
                    className="rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
                  >
                    Approve
                  </button>
                )}
                {review.status !== "HIDDEN" && (
                  <button
                    type="button"
                    onClick={() => moderate(review.id, "HIDDEN")}
                    disabled={isPending}
                    className="rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-black/5 disabled:opacity-50"
                  >
                    Hide
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(review.id)}
                  disabled={isPending}
                  className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </Card>
          );
        })}
        {reviews && reviews.length === 0 && <Card className="p-8 text-center text-muted">No reviews yet.</Card>}
        {!reviews && <Card className="p-8 text-center text-muted">Loading…</Card>}
      </div>
    </div>
  );
}
