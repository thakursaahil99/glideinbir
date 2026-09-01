"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatINR } from "@/lib/format";

type Slot = {
  id: string;
  date: string;
  startTime: string;
  capacity: number;
  bookedSeats: number;
};

export function BookParaglidingWidget({
  packageId,
  slots,
  pricePerPerson,
  isLoggedIn,
  customer,
}: {
  packageId: string;
  slots: Slot[];
  pricePerPerson: number;
  isLoggedIn: boolean;
  customer?: { name: string; email: string; phone: string | null };
}) {
  const router = useRouter();
  const [slotId, setSlotId] = useState(slots[0]?.id ?? "");
  const [passengers, setPassengers] = useState(1);
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToast();
  const [isPending, startTransition] = useTransition();

  const selectedSlot = slots.find((s) => s.id === slotId);
  const seatsLeft = selectedSlot ? selectedSlot.capacity - selectedSlot.bookedSeats : 0;
  const total = useMemo(() => pricePerPerson * passengers, [pricePerPerson, passengers]);

  function handleBook() {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!selectedSlot) {
      setError("Please select a slot.");
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
          items: [{ itemType: "PARAGLIDING", packageId, slotId, passengers }],
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: phone.trim(),
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        const message = body.error?.message ?? "Could not create booking. Please try again.";
        setError(message);
        showError(message);
        return;
      }
      router.push(`/booking/${body.data.id}`);
    });
  }

  if (slots.length === 0) {
    return <p className="text-sm text-muted">No upcoming slots — check back soon.</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Date & time</label>
        <select
          value={slotId}
          onChange={(e) => setSlotId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        >
          {slots.map((slot) => {
            const left = slot.capacity - slot.bookedSeats;
            return (
              <option key={slot.id} value={slot.id} disabled={left <= 0}>
                {formatDate(slot.date)} · {slot.startTime} · {left > 0 ? `${left} seats left` : "Full"}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Passengers</label>
        <input
          type="number"
          min={1}
          max={Math.max(seatsLeft, 1)}
          value={passengers}
          onChange={(e) => setPassengers(Math.max(1, Number(e.target.value)))}
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
        {isPending ? "Booking…" : isLoggedIn ? "Book & Pay" : "Log in to book"}
      </Button>
    </div>
  );
}
