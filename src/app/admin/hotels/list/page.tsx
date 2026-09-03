"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableSearch, matchesSearch } from "@/components/admin/table-search";

type Hotel = {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  checkInTime: string;
  checkOutTime: string;
  isActive: boolean;
};

const EMPTY_FORM = {
  name: "",
  description: "",
  address: "",
  city: "",
  checkInTime: "12:00",
  checkOutTime: "10:00",
  isActive: true,
};

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => hotels?.filter((h) => matchesSearch(h, search)), [hotels, search]);

  function load() {
    fetch("/api/admin/hotels")
      .then((res) => res.json())
      .then((body) => setHotels(body.success ? body.data.items : []));
  }

  useEffect(load, []);

  function startEdit(hotel: Hotel) {
    setForm({
      name: hotel.name,
      description: hotel.description,
      address: hotel.address,
      city: hotel.city,
      checkInTime: hotel.checkInTime,
      checkOutTime: hotel.checkOutTime,
      isActive: hotel.isActive,
    });
    setEditingId(hotel.id);
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
      const url = editingId ? `/api/admin/hotels/${editingId}` : "/api/admin/hotels";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Could not save hotel.");
        return;
      }
      cancelEdit();
      load();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this? You can restore it later from Deleted data (Super Admin only).")) return;
    startTransition(async () => {
      await fetch(`/api/admin/hotels/${id}`, { method: "DELETE" });
      if (editingId === id) cancelEdit();
      load();
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Hotels</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
        <TableSearch value={search} onChange={setSearch} placeholder="Search by name, city…" />
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-sm">
            <thead className="border-b border-border bg-surface text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered?.map((hotel) => (
                <tr
                  key={hotel.id}
                  className={
                    hotel.id === editingId
                      ? "border-b border-border bg-brand/5 last:border-0 ring-1 ring-inset ring-brand/15"
                      : "border-b border-border last:border-0 transition-colors hover:bg-black/[0.025]"
                  }
                >
                  <td className="px-4 py-3 font-medium">{hotel.name}</td>
                  <td className="px-4 py-3">{hotel.city}</td>
                  <td className="px-4 py-3">
                    <Badge tone={hotel.isActive ? "success" : "danger"}>
                      {hotel.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      href={`/admin/hotels/list/${hotel.id}/rooms`}
                      className="rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10"
                    >
                      Rooms
                    </Link>
                    <button
                      type="button"
                      onClick={() => startEdit(hotel)}
                      disabled={isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(hotel.id)}
                      disabled={isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {hotels && filtered && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    {search ? "No matches." : "No hotels yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
        </div>

        <Card className="h-fit p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{editingId ? "Edit hotel" : "Add new hotel"}</h3>
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
              <label className="text-sm font-medium">Description</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <input
                required
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">City</label>
              <input
                required
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Check-in</label>
                <input
                  type="time"
                  required
                  value={form.checkInTime}
                  onChange={(e) => setForm((f) => ({ ...f, checkInTime: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Check-out</label>
                <input
                  type="time"
                  required
                  value={form.checkOutTime}
                  onChange={(e) => setForm((f) => ({ ...f, checkOutTime: e.target.value }))}
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
              {isPending ? "Saving…" : editingId ? "Save changes" : "Create hotel"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
