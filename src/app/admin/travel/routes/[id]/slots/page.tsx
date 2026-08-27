"use client";

import { use, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

type Slot = {
  id: string;
  date: string;
  departureTime: string;
  capacity: number;
  bookedSeats: number;
  status: string;
};

function SlotEditCell({ slot, onSaved }: { slot: Slot; onSaved: () => void }) {
  const [capacity, setCapacity] = useState(String(slot.capacity));
  const [status, setStatus] = useState(slot.status);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirty = capacity !== String(slot.capacity) || status !== slot.status;

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/travel/slots/${slot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capacity: Number(capacity), status }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Could not update departure.");
        return;
      }
      onSaved();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        min={0}
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        className="w-20 rounded-lg border border-border px-2 py-1 text-sm"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-lg border border-border px-2 py-1 text-sm"
      >
        <option value="ACTIVE">ACTIVE</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>
      {dirty && (
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="text-xs font-medium text-brand hover:underline disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      )}
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function AdminTravelRouteSlotsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ date: "", departureTime: "07:00", capacity: "40" });

  function load() {
    fetch(`/api/admin/travel/routes/${id}/slots`)
      .then((res) => res.json())
      .then((body) => setSlots(body.success ? body.data : []));
  }

  useEffect(load, [id]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/travel/routes/${id}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, capacity: Number(form.capacity) }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Could not create departure.");
        return;
      }
      setForm({ date: "", departureTime: "07:00", capacity: "40" });
      load();
    });
  }

  function handleDelete(slotId: string) {
    startTransition(async () => {
      await fetch(`/api/admin/travel/slots/${slotId}`, { method: "DELETE" });
      load();
    });
  }

  return (
    <div>
      <Link href="/admin/travel/routes" className="text-sm text-muted hover:text-ink">
        ← Back to routes
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Departures</h1>
      <p className="mt-1 text-sm text-muted">Capacity and status can be edited inline; date/time are fixed once created.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Booked</th>
                <th className="px-4 py-3">Capacity / Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {slots?.map((slot) => (
                <tr key={slot.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{formatDate(slot.date)}</td>
                  <td className="px-4 py-3">{slot.departureTime}</td>
                  <td className="px-4 py-3">{slot.bookedSeats}</td>
                  <td className="px-4 py-3">
                    <SlotEditCell slot={slot} onSaved={load} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(slot.id)}
                      disabled={isPending}
                      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {slots && slots.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    No departures yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card className="h-fit p-5">
          <h3 className="font-semibold">Add departure</h3>
          <form onSubmit={handleCreate} className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Departure time</label>
              <input
                type="time"
                required
                value={form.departureTime}
                onChange={(e) => setForm((f) => ({ ...f, departureTime: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Capacity</label>
              <input
                type="number"
                required
                min={1}
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Saving…" : "Add departure"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
