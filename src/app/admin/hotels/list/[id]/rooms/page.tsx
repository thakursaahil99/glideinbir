"use client";

import { use, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { TableSearch, matchesSearch } from "@/components/admin/table-search";

type Room = {
  id: string;
  name: string;
  type: string;
  description: string;
  occupancyAdults: number;
  occupancyChildren: number;
  pricePerNight: string;
  totalRooms: number;
  isActive: boolean;
};

const EMPTY_FORM = {
  name: "",
  type: "",
  description: "",
  occupancyAdults: "2",
  occupancyChildren: "0",
  pricePerNight: "",
  totalRooms: "",
  isActive: true,
};

export default function AdminHotelRoomsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => rooms?.filter((r) => matchesSearch(r, search)), [rooms, search]);

  function load() {
    fetch(`/api/admin/hotels/${id}/rooms`)
      .then((res) => res.json())
      .then((body) => setRooms(body.success ? body.data : []));
  }

  useEffect(load, [id]);

  function startEdit(room: Room) {
    setForm({
      name: room.name,
      type: room.type,
      description: room.description,
      occupancyAdults: String(room.occupancyAdults),
      occupancyChildren: String(room.occupancyChildren),
      pricePerNight: String(room.pricePerNight),
      totalRooms: String(room.totalRooms),
      isActive: room.isActive,
    });
    setEditingId(room.id);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const url = editingId ? `/api/admin/hotels/rooms/${editingId}` : `/api/admin/hotels/${id}/rooms`;
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          occupancyAdults: Number(form.occupancyAdults),
          occupancyChildren: Number(form.occupancyChildren),
          pricePerNight: Number(form.pricePerNight),
          totalRooms: Number(form.totalRooms),
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Could not save room.");
        return;
      }
      cancelEdit();
      load();
    });
  }

  function handleDelete(roomId: string) {
    if (!confirm("Delete this room? You can restore it later from Deleted data (Super Admin only).")) return;
    startTransition(async () => {
      await fetch(`/api/admin/hotels/rooms/${roomId}`, { method: "DELETE" });
      if (editingId === roomId) cancelEdit();
      load();
    });
  }

  return (
    <div>
      <Link href="/admin/hotels/list" className="text-sm text-muted hover:text-ink">
        ← Back to hotels
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Rooms</h1>
      <p className="mt-1 text-sm text-muted">
        Creating a room generates 365 days of availability automatically. Changing
        &quot;Total rooms&quot; here updates availability for all future dates.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
        <TableSearch value={search} onChange={setSearch} placeholder="Search by name, type…" />
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-sm">
            <thead className="border-b border-border bg-surface text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Price/night</th>
                <th className="px-4 py-3">Rooms</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered?.map((room) => (
                <tr
                  key={room.id}
                  className={
                    room.id === editingId
                      ? "border-b border-border bg-brand/5 last:border-0 ring-1 ring-inset ring-brand/15"
                      : "border-b border-border last:border-0 transition-colors hover:bg-black/[0.025]"
                  }
                >
                  <td className="px-4 py-3 font-medium">{room.name}</td>
                  <td className="px-4 py-3">{room.type}</td>
                  <td className="px-4 py-3">{formatINR(room.pricePerNight)}</td>
                  <td className="px-4 py-3">{room.totalRooms}</td>
                  <td className="px-4 py-3">
                    <Badge tone={room.isActive ? "success" : "danger"}>
                      {room.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      type="button"
                      onClick={() => startEdit(room)}
                      disabled={isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(room.id)}
                      disabled={isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rooms && filtered && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    {search ? "No matches." : "No rooms yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
        </div>

        <Card className="h-fit p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{editingId ? "Edit room" : "Add room"}</h3>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="text-xs font-medium text-muted hover:text-ink">
                Cancel
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <input
                required
                placeholder="Deluxe, Suite…"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                required
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Adults</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.occupancyAdults}
                  onChange={(e) => setForm((f) => ({ ...f, occupancyAdults: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Children</label>
                <input
                  type="number"
                  min={0}
                  value={form.occupancyChildren}
                  onChange={(e) => setForm((f) => ({ ...f, occupancyChildren: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Price/night (₹)</label>
                <input
                  type="number"
                  required
                  value={form.pricePerNight}
                  onChange={(e) => setForm((f) => ({ ...f, pricePerNight: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Total rooms</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.totalRooms}
                  onChange={(e) => setForm((f) => ({ ...f, totalRooms: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Active (visible on the site)
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Saving…" : editingId ? "Save changes" : "Add room"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
