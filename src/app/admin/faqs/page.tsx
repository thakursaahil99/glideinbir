"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableSearch, matchesSearch } from "@/components/admin/table-search";

type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  paraglidingPackageId: string | null;
  schoolCourseId: string | null;
  hotelId: string | null;
  paraglidingPackage: { title: string } | null;
  schoolCourse: { title: string } | null;
  hotel: { name: string } | null;
};

type TargetOption = { id: string; label: string };

const CATEGORIES = ["GENERAL", "PARAGLIDING", "SCHOOL", "HOTEL"] as const;

const EMPTY_FORM = {
  question: "",
  answer: "",
  category: "GENERAL" as (typeof CATEGORIES)[number],
  order: "0",
  isActive: true,
  targetId: "",
};

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<Faq[] | null>(null);
  const [targets, setTargets] = useState<Record<string, TargetOption[]>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => faqs?.filter((f) => matchesSearch(f, search)), [faqs, search]);

  function load() {
    fetch("/api/admin/faqs")
      .then((res) => res.json())
      .then((body) => setFaqs(body.success ? body.data : []));
  }

  useEffect(load, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/paragliding/packages").then((r) => r.json()),
      fetch("/api/admin/school/courses").then((r) => r.json()),
      fetch("/api/admin/hotels").then((r) => r.json()),
    ]).then(([pkgs, courses, hotels]) => {
      setTargets({
        PARAGLIDING: (pkgs.success ? pkgs.data.items : []).map((p: { id: string; title: string }) => ({
          id: p.id,
          label: p.title,
        })),
        SCHOOL: (courses.success ? courses.data.items : []).map((c: { id: string; title: string }) => ({
          id: c.id,
          label: c.title,
        })),
        HOTEL: (hotels.success ? hotels.data.items : []).map((h: { id: string; name: string }) => ({
          id: h.id,
          label: h.name,
        })),
      });
    });
  }, []);

  function targetField(category: string) {
    if (category === "PARAGLIDING") return "paraglidingPackageId";
    if (category === "SCHOOL") return "schoolCourseId";
    if (category === "HOTEL") return "hotelId";
    return null;
  }

  function startEdit(faq: Faq) {
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category as (typeof CATEGORIES)[number],
      order: String(faq.order),
      isActive: faq.isActive,
      targetId: faq.paraglidingPackageId ?? faq.schoolCourseId ?? faq.hotelId ?? "",
    });
    setEditingId(faq.id);
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
      const field = targetField(form.category);
      const payload: Record<string, unknown> = {
        question: form.question,
        answer: form.answer,
        category: form.category,
        order: Number(form.order),
        isActive: form.isActive,
        paraglidingPackageId: null,
        schoolCourseId: null,
        hotelId: null,
      };
      if (field && form.targetId) payload[field] = form.targetId;

      const url = editingId ? `/api/admin/faqs/${editingId}` : "/api/admin/faqs";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Could not save.");
        return;
      }
      cancelEdit();
      load();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this FAQ? You can restore it later from Deleted data (Super Admin only).")) return;
    startTransition(async () => {
      await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      if (editingId === id) cancelEdit();
      load();
    });
  }

  const currentTargets = targets[form.category] ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">FAQs</h1>
      <p className="mt-1 text-sm text-muted">
        General FAQs show on the FAQ page; category FAQs also show on that module&apos;s pages; linking
        to a specific package/course/hotel shows it only there.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
        <TableSearch value={search} onChange={setSearch} placeholder="Search by question, answer…" />
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Linked to</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered?.map((faq) => (
                <tr
                  key={faq.id}
                  className={
                    faq.id === editingId
                      ? "border-b border-border bg-brand/5 last:border-0 ring-1 ring-inset ring-brand/15"
                      : "border-b border-border last:border-0 transition-colors hover:bg-black/[0.025]"
                  }
                >
                  <td className="px-4 py-3 font-medium">{faq.question}</td>
                  <td className="px-4 py-3">
                    <Badge>{faq.category}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {faq.paraglidingPackage?.title ?? faq.schoolCourse?.title ?? faq.hotel?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={faq.isActive ? "success" : "danger"}>
                      {faq.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <button
                      type="button"
                      onClick={() => startEdit(faq)}
                      disabled={isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(faq.id)}
                      disabled={isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {faqs && filtered && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    {search ? "No matches." : "No FAQs yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
        </div>

        <Card className="h-fit p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{editingId ? "Edit FAQ" : "Add new FAQ"}</h3>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="text-xs font-medium text-muted hover:text-ink">
                Cancel
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Question</label>
              <input
                required
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Answer</label>
              <textarea
                required
                rows={3}
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value as (typeof CATEGORIES)[number], targetId: "" }))
                }
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {form.category !== "GENERAL" && (
              <div>
                <label className="text-sm font-medium">Link to a specific one (optional)</label>
                <select
                  value={form.targetId}
                  onChange={(e) => setForm((f) => ({ ...f, targetId: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <option value="">Applies to all {form.category.toLowerCase()} pages</option>
                  {currentTargets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                className="mt-1 w-24 rounded-lg border border-border px-3 py-2 text-sm"
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
              {isPending ? "Saving…" : editingId ? "Save changes" : "Create FAQ"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
