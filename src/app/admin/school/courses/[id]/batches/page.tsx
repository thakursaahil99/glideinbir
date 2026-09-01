"use client";

import { use, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

type Instructor = { id: string; name: string };
type Batch = {
  id: string;
  startDate: string;
  endDate: string;
  location: string;
  maxStudents: number;
  bookedSeats: number;
  status: string;
  instructor: { id: string; name: string };
};

const STATUSES = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

const EMPTY_FORM = {
  instructorId: "",
  startDate: "",
  endDate: "",
  location: "",
  maxStudents: "6",
  status: "UPCOMING",
};

export default function AdminCourseBatchesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [batches, setBatches] = useState<Batch[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(EMPTY_FORM);

  function load() {
    fetch("/api/admin/school/instructors")
      .then((res) => res.json())
      .then((body) => setInstructors(body.success ? body.data : []));
    fetch(`/api/admin/school/courses/${id}/batches`)
      .then((res) => res.json())
      .then((body) => setBatches(body.success ? body.data : []));
  }

  useEffect(load, [id]);

  function startEdit(batch: Batch) {
    setForm({
      instructorId: batch.instructor.id,
      startDate: batch.startDate.slice(0, 10),
      endDate: batch.endDate.slice(0, 10),
      location: batch.location,
      maxStudents: String(batch.maxStudents),
      status: batch.status,
    });
    setEditingId(batch.id);
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
        ? `/api/admin/school/batches/${editingId}`
        : `/api/admin/school/courses/${id}/batches`;
      const payload: Record<string, unknown> = { ...form, maxStudents: Number(form.maxStudents) };
      if (!editingId) delete payload.status; // create doesn't accept status
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Could not save batch.");
        return;
      }
      cancelEdit();
      load();
    });
  }

  function handleDelete(batchId: string) {
    if (!confirm("Delete this batch?")) return;
    startTransition(async () => {
      await fetch(`/api/admin/school/batches/${batchId}`, { method: "DELETE" });
      if (editingId === batchId) cancelEdit();
      load();
    });
  }

  return (
    <div>
      <Link href="/admin/school/courses" className="text-sm text-muted hover:text-ink">
        ← Back to courses
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Batches</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Instructor</th>
                <th className="px-4 py-3">Seats</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {batches?.map((batch) => (
                <tr
                  key={batch.id}
                  className={
                    batch.id === editingId
                      ? "border-b border-border bg-brand/5 last:border-0 ring-1 ring-inset ring-brand/15"
                      : "border-b border-border last:border-0 transition-colors hover:bg-black/[0.025]"
                  }
                >
                  <td className="px-4 py-3">
                    {formatDate(batch.startDate)} – {formatDate(batch.endDate)}
                  </td>
                  <td className="px-4 py-3">{batch.instructor.name}</td>
                  <td className="px-4 py-3">
                    {batch.bookedSeats} / {batch.maxStudents}
                  </td>
                  <td className="px-4 py-3">
                    <Badge>{batch.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      type="button"
                      onClick={() => startEdit(batch)}
                      disabled={isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(batch.id)}
                      disabled={isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {batches && batches.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    No batches yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card className="h-fit p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{editingId ? "Edit batch" : "Add batch"}</h3>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="text-xs font-medium text-muted hover:text-ink">
                Cancel
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Instructor</label>
              <select
                required
                value={form.instructorId}
                onChange={(e) => setForm((f) => ({ ...f, instructorId: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Start date</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End date</label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
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
            <div>
              <label className="text-sm font-medium">Max students</label>
              <input
                type="number"
                required
                min={1}
                value={form.maxStudents}
                onChange={(e) => setForm((f) => ({ ...f, maxStudents: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            {editingId && (
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Saving…" : editingId ? "Save changes" : "Add batch"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
