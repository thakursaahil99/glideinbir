"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";

type Category = { id: string; name: string };
type Item = {
  id: string;
  title: string;
  slug: string;
  description: string;
  pricingUnit: string;
  price: string;
  durationLabel: string;
  location: string;
  isActive: boolean;
  category: { id: string; name: string };
};

const PRICING_UNITS = ["PER_PERSON", "PER_NIGHT", "PER_GROUP", "FIXED"];

const EMPTY_FORM = {
  categoryId: "",
  title: "",
  description: "",
  pricingUnit: "PER_PERSON",
  price: "",
  durationLabel: "",
  location: "",
  isActive: true,
};

export default function AdminAdventureItemsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(EMPTY_FORM);

  function load() {
    fetch("/api/admin/adventure/categories")
      .then((res) => res.json())
      .then((body) => setCategories(body.success ? body.data : []));
    fetch("/api/admin/adventure/items")
      .then((res) => res.json())
      .then((body) => setItems(body.success ? body.data.items : []));
  }

  useEffect(load, []);

  function startEdit(item: Item) {
    setForm({
      categoryId: item.category.id,
      title: item.title,
      description: item.description,
      pricingUnit: item.pricingUnit,
      price: String(item.price),
      durationLabel: item.durationLabel,
      location: item.location,
      isActive: item.isActive,
    });
    setEditingId(item.id);
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
        ? `/api/admin/adventure/items/${editingId}`
        : "/api/admin/adventure/items";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Could not save item.");
        return;
      }
      cancelEdit();
      load();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this? You can restore it later from Deleted data (Super Admin only).")) return;
    startTransition(async () => {
      await fetch(`/api/admin/adventure/items/${id}`, { method: "DELETE" });
      if (editingId === id) cancelEdit();
      load();
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Adventure items</h1>
      <p className="mt-1 text-sm text-muted">Camping, trekking, cottages/stays, and other adventure activities.</p>

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
              {items?.map((item) => (
                <tr
                  key={item.id}
                  className={
                    item.id === editingId
                      ? "border-b border-border bg-brand/5 last:border-0 ring-1 ring-inset ring-brand/15"
                      : "border-b border-border last:border-0 transition-colors hover:bg-black/[0.025]"
                  }
                >
                  <td className="px-4 py-3 font-medium">{item.title}</td>
                  <td className="px-4 py-3">{item.category.name}</td>
                  <td className="px-4 py-3">
                    {formatINR(item.price)} <span className="text-xs text-muted">{item.pricingUnit.replace("_", " ").toLowerCase()}</span>
                  </td>
                  <td className="px-4 py-3">{item.durationLabel}</td>
                  <td className="px-4 py-3">
                    <Badge className={item.isActive ? "" : "bg-red-50 text-red-700"}>
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      href={`/admin/adventure/items/${item.id}/slots`}
                      className="rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10"
                    >
                      Slots
                    </Link>
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      disabled={isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    No items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card className="h-fit p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{editingId ? "Edit item" : "Add new item"}</h3>
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
                  placeholder="e.g. 2D/1N"
                  required
                  value={form.durationLabel}
                  onChange={(e) => setForm((f) => ({ ...f, durationLabel: e.target.value }))}
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
              {isPending ? "Saving…" : editingId ? "Save changes" : "Create item"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
