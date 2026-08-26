"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatDate, formatINR } from "@/lib/format";

type Batch = {
  id: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  bookedSeats: number;
  instructor: { name: string };
};

export function BookSchoolWidget({
  courseId,
  batches,
  fee,
  isLoggedIn,
  customer,
}: {
  courseId: string;
  batches: Batch[];
  fee: number;
  isLoggedIn: boolean;
  customer?: { name: string; email: string; phone: string | null };
}) {
  const router = useRouter();
  const [batchId, setBatchId] = useState(batches[0]?.id ?? "");
  const [students, setStudents] = useState(1);
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedBatch = batches.find((b) => b.id === batchId);
  const seatsLeft = selectedBatch ? selectedBatch.maxStudents - selectedBatch.bookedSeats : 0;
  const total = useMemo(() => fee * students, [fee, students]);

  function handleBook() {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!selectedBatch) {
      setError("Please select a batch.");
      return;
    }
    if (!customer || phone.trim().length < 6) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ itemType: "SCHOOL", courseId, batchId, students }],
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: phone.trim(),
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Could not create booking. Please try again.");
        return;
      }
      router.push(`/booking/${body.data.id}`);
    });
  }

  if (batches.length === 0) {
    return <p className="text-sm text-muted">No upcoming batches — check back soon.</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Batch</label>
        <select
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        >
          {batches.map((batch) => {
            const left = batch.maxStudents - batch.bookedSeats;
            return (
              <option key={batch.id} value={batch.id} disabled={left <= 0}>
                {formatDate(batch.startDate)} – {formatDate(batch.endDate)} · {batch.instructor.name} ·{" "}
                {left > 0 ? `${left} seats left` : "Full"}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Students</label>
        <input
          type="number"
          min={1}
          max={Math.max(seatsLeft, 1)}
          value={students}
          onChange={(e) => setStudents(Math.max(1, Number(e.target.value)))}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </div>

      {isLoggedIn && (
        <div>
          <label className="text-sm font-medium">Contact phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="For booking updates"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
      )}

      <div className="flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-sm text-muted">Total</span>
        <span className="text-xl font-bold">{formatINR(total)}</span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button className="w-full" disabled={isPending || seatsLeft <= 0} onClick={handleBook}>
        {isPending ? "Booking…" : isLoggedIn ? "Enroll & Pay" : "Log in to enroll"}
      </Button>
    </div>
  );
}
