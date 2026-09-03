"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { TableSearch, matchesSearch } from "@/components/admin/table-search";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  fee: string;
  durationDays: number;
  level: string;
  location: string;
  isActive: boolean;
};

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "CERTIFICATION"];

const EMPTY_FORM = {
  title: "",
  description: "",
  level: "BEGINNER",
  durationDays: "",
  fee: "",
  location: "",
  isActive: true,
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => courses?.filter((c) => matchesSearch(c, search)), [courses, search]);

  function load() {
    fetch("/api/admin/school/courses")
      .then((res) => res.json())
      .then((body) => setCourses(body.success ? body.data.items : []));
  }

  useEffect(load, []);

  function startEdit(course: Course) {
    setForm({
      title: course.title,
      description: course.description,
      level: course.level,
      durationDays: String(course.durationDays),
      fee: String(course.fee),
      location: course.location,
      isActive: course.isActive,
    });
    setEditingId(course.id);
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
      const url = editingId ? `/api/admin/school/courses/${editingId}` : "/api/admin/school/courses";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          durationDays: Number(form.durationDays),
          fee: Number(form.fee),
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Could not save course.");
        return;
      }
      cancelEdit();
      load();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this? You can restore it later from Deleted data (Super Admin only).")) return;
    startTransition(async () => {
      await fetch(`/api/admin/school/courses/${id}`, { method: "DELETE" });
      if (editingId === id) cancelEdit();
      load();
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Courses</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
        <TableSearch value={search} onChange={setSearch} placeholder="Search by title, level, location…" />
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-sm">
            <thead className="border-b border-border bg-surface text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Fee</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered?.map((course) => (
                <tr
                  key={course.id}
                  className={
                    course.id === editingId
                      ? "border-b border-border bg-brand/5 last:border-0 ring-1 ring-inset ring-brand/15"
                      : "border-b border-border last:border-0 transition-colors hover:bg-black/[0.025]"
                  }
                >
                  <td className="px-4 py-3 font-medium">{course.title}</td>
                  <td className="px-4 py-3">{course.level}</td>
                  <td className="px-4 py-3">{formatINR(course.fee)}</td>
                  <td className="px-4 py-3">{course.durationDays} days</td>
                  <td className="px-4 py-3">
                    <Badge tone={course.isActive ? "success" : "danger"}>
                      {course.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      href={`/admin/school/courses/${course.id}/batches`}
                      className="rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10"
                    >
                      Batches
                    </Link>
                    <button
                      type="button"
                      onClick={() => startEdit(course)}
                      disabled={isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(course.id)}
                      disabled={isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {courses && filtered && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    {search ? "No matches." : "No courses yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
        </div>

        <Card className="h-fit p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{editingId ? "Edit course" : "Add new course"}</h3>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="text-xs font-medium text-muted hover:text-ink">
                Cancel
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
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
              <label className="text-sm font-medium">Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Fee (₹)</label>
                <input
                  type="number"
                  required
                  value={form.fee}
                  onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Duration (days)</label>
                <input
                  type="number"
                  required
                  value={form.durationDays}
                  onChange={(e) => setForm((f) => ({ ...f, durationDays: e.target.value }))}
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
              {isPending ? "Saving…" : editingId ? "Save changes" : "Create course"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
