"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";

type Category = { id: string; name: string };
type Package = {
  id: string;
  title: string;
  slug: string;
  description: string;
  flightType: string;
  price: string;
  durationMinutes: number;
  location: string;
  isActive: boolean;
  category: { id: string; name: string };
};

const FLIGHT_TYPES = ["TANDEM", "SOLO", "CROSS_COUNTRY"];

const EMPTY_FORM = {
  categoryId: "",
  title: "",
  description: "",
  flightType: "TANDEM",
  price: "",
  durationMinutes: "",
  location: "",
  isActive: true,
};

export default function AdminPackagesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [packages, setPackages] = useState<Package[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(EMPTY_FORM);

  function load() {
    fetch("/api/admin/paragliding/categories")
      .then((res) => res.json())
      .then((body) => setCategories(body.success ? body.data : []));
    fetch("/api/admin/paragliding/packages")
      .then((res) => res.json())
      .then((body) => setPackages(body.success ? body.data.items : []));
  }

  useEffect(load, []);

  function startEdit(pkg: Package) {
    setForm({
      categoryId: pkg.category.id,
      title: pkg.title,
      description: pkg.description,
      flightType: pkg.flightType,
      price: String(pkg.price),
      durationMinutes: String(pkg.durationMinutes),
      location: pkg.location,
      isActive: pkg.isActive,
    });
    setEditingId(pkg.id);
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
      const url = editingId
        ? `/api/admin/paragliding/packages/${editingId}`
        : "/api/admin/paragliding/packages";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          durationMinutes: Number(form.durationMinutes),
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Could not save package.");
        return;
      }
      cancelEdit();
      load();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this? You can restore it later from Deleted data (Super Admin only).")) return;
    startTransition(async () => {
      await fetch(`/api/admin/paragliding/packages/${id}`, { method: "DELETE" });
      if (editingId === id) cancelEdit();
      load();
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Paragliding packages</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {packages?.map((pkg) => (
                <tr
                  key={pkg.id}
                  className={
                    pkg.id === editingId
                      ? "border-b border-border bg-brand/5 last:border-0 ring-1 ring-inset ring-brand/15"
                      : "border-b border-border last:border-0 transition-colors hover:bg-black/[0.025]"
                  }
                >
                  <td className="px-4 py-3 font-medium">{pkg.title}</td>
                  <td className="px-4 py-3">{pkg.category.name}</td>
                  <td className="px-4 py-3">{formatINR(pkg.price)}</td>
                  <td className="px-4 py-3">{pkg.durationMinutes} min</td>
                  <td className="px-4 py-3">
                    <Badge className={pkg.isActive ? "" : "bg-red-50 text-red-700"}>
                      {pkg.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      href={`/admin/paragliding/packages/${pkg.id}/slots`}
                      className="rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10"
                    >
                      Slots
                    </Link>
                    <button
                      type="button"
                      onClick={() => startEdit(pkg)}
                      disabled={isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(pkg.id)}
                      disabled={isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {packages && packages.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    No packages yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card className="h-fit p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{editingId ? "Edit package" : "Add new package"}</h3>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="text-xs font-medium text-muted hover:text-ink">
                Cancel
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
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
              <label className="text-sm font-medium">Flight type</label>
              <select
                value={form.flightType}
                onChange={(e) => setForm((f) => ({ ...f, flightType: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                {FLIGHT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ")}
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
                <label className="text-sm font-medium">Duration (min)</label>
                <input
                  type="number"
                  required
                  value={form.durationMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <input
                required
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
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
              {isPending ? "Saving…" : editingId ? "Save changes" : "Create package"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
