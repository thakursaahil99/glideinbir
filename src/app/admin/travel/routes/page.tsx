"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";

type Route = {
  id: string;
  mode: string;
  title: string;
  slug: string;
  fromLocation: string;
  toLocation: string;
  vehicleType: string;
  description: string;
  pricingUnit: string;
  price: string;
  durationLabel: string;
  capacity: number;
  isActive: boolean;
};

const MODES = ["BUS", "TAXI"];
const PRICING_UNITS = ["PER_SEAT", "PER_TRIP"];

const EMPTY_FORM = {
  mode: "BUS",
  title: "",
  fromLocation: "",
  toLocation: "",
  vehicleType: "",
  description: "",
  pricingUnit: "PER_SEAT",
  price: "",
  durationLabel: "",
  capacity: "",
  isActive: true,
};

export default function AdminTravelRoutesPage() {
  const [routes, setRoutes] = useState<Route[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(EMPTY_FORM);

  function load() {
    fetch("/api/admin/travel/routes")
      .then((res) => res.json())
      .then((body) => setRoutes(body.success ? body.data.items : []));
  }

  useEffect(load, []);

  function startEdit(route: Route) {
    setForm({
      mode: route.mode,
      title: route.title,
      fromLocation: route.fromLocation,
      toLocation: route.toLocation,
      vehicleType: route.vehicleType,
      description: route.description,
      pricingUnit: route.pricingUnit,
      price: String(route.price),
      durationLabel: route.durationLabel,
      capacity: String(route.capacity),
      isActive: route.isActive,
    });
    setEditingId(route.id);
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
      const url = editingId ? `/api/admin/travel/routes/${editingId}` : "/api/admin/travel/routes";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          capacity: Number(form.capacity),
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Could not save route.");
        return;
      }
      cancelEdit();
      load();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await fetch(`/api/admin/travel/routes/${id}`, { method: "DELETE" });
      if (editingId === id) cancelEdit();
      load();
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Travel routes</h1>
      <p className="mt-1 text-sm text-muted">Volvo bus and taxi transport.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {routes?.map((route) => (
                <tr
                  key={route.id}
                  className={
                    route.id === editingId
                      ? "border-b border-border bg-brand/5 last:border-0"
                      : "border-b border-border last:border-0"
                  }
                >
                  <td className="px-4 py-3 font-medium">
                    {route.title}
                    <div className="text-xs font-normal text-muted">
                      {route.fromLocation} → {route.toLocation}
                    </div>
                  </td>
                  <td className="px-4 py-3">{route.mode}</td>
                  <td className="px-4 py-3">
                    {formatINR(route.price)}{" "}
                    <span className="text-xs text-muted">{route.pricingUnit.replace("_", " ").toLowerCase()}</span>
                  </td>
                  <td className="px-4 py-3">{route.durationLabel}</td>
                  <td className="px-4 py-3">
                    <Badge className={route.isActive ? "" : "bg-red-50 text-red-700"}>
                      {route.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      href={`/admin/travel/routes/${route.id}/slots`}
                      className="text-xs font-medium text-brand hover:underline"
                    >
                      Departures
                    </Link>
                    <button
                      type="button"
                      onClick={() => startEdit(route)}
                      disabled={isPending}
                      className="text-xs font-medium text-brand hover:underline disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(route.id)}
                      disabled={isPending}
                      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {routes && routes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    No routes yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card className="h-fit p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{editingId ? "Edit route" : "Add new route"}</h3>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="text-xs font-medium text-muted hover:text-ink">
                Cancel
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Mode</label>
              <select
                value={form.mode}
                onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                {MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">From</label>
                <input
                  required
                  value={form.fromLocation}
                  onChange={(e) => setForm((f) => ({ ...f, fromLocation: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">To</label>
                <input
                  required
                  value={form.toLocation}
                  onChange={(e) => setForm((f) => ({ ...f, toLocation: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Vehicle type</label>
              <input
                placeholder="e.g. Volvo AC Sleeper, Sedan, SUV"
                required
                value={form.vehicleType}
                onChange={(e) => setForm((f) => ({ ...f, vehicleType: e.target.value }))}
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
              <label className="text-sm font-medium">Pricing unit</label>
              <select
                value={form.pricingUnit}
                onChange={(e) => setForm((f) => ({ ...f, pricingUnit: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                {PRICING_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Price (₹)</label>
                <input
                  type="number"
                  required
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Duration</label>
                <input
                  placeholder="e.g. 10-11 hrs"
                  required
                  value={form.durationLabel}
                  onChange={(e) => setForm((f) => ({ ...f, durationLabel: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Capacity (seats/vehicles per departure)</label>
              <input
                type="number"
                required
                min={1}
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
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
              {isPending ? "Saving…" : editingId ? "Save changes" : "Create route"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
