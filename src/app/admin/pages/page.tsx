"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

type Page = { key: string; title: string; body: string; updatedAt: string };

// Known CMS-backed pages. Add a row here (and a matching page.tsx reading
// pageContentService.getByKey) to make a new one editable from here.
const KNOWN_PAGES = [
  { key: "terms", label: "Terms of Service", href: "/terms" },
  { key: "privacy", label: "Privacy Policy", href: "/privacy" },
  { key: "cancellation-policy", label: "Cancellation & Refund Policy", href: "/cancellation-policy" },
];

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Record<string, Page>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", body: "" });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function load() {
    fetch("/api/admin/pages")
      .then((res) => res.json())
      .then((body) => {
        if (!body.success) return;
        const map: Record<string, Page> = {};
        for (const p of body.data as Page[]) map[p.key] = p;
        setPages(map);
      });
  }

  useEffect(load, []);

  function startEdit(key: string, fallbackLabel: string) {
    const existing = pages[key];
    setForm({ title: existing?.title ?? fallbackLabel, body: existing?.body ?? "" });
    setEditingKey(key);
    setError(null);
  }

  function cancelEdit() {
    setEditingKey(null);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingKey) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/pages/${editingKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Could not save.");
        return;
      }
      setEditingKey(null);
      load();
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Site pages</h1>
      <p className="mt-1 text-sm text-muted">
        Edit the Terms, Privacy, and Cancellation Policy pages shown on the site&apos;s footer.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          {KNOWN_PAGES.map((p) => {
            const existing = pages[p.key];
            return (
              <Card key={p.key} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{p.label}</p>
                    <p className="text-xs text-muted">
                      {existing ? `Last updated ${formatDate(existing.updatedAt)}` : "Not customized yet"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(p.key, p.label)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10"
                  >
                    Edit
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        {editingKey && (
          <Card className="h-fit p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Editing {KNOWN_PAGES.find((p) => p.key === editingKey)?.label}</h3>
              <button type="button" onClick={cancelEdit} className="text-xs font-medium text-muted hover:text-ink">
                Cancel
              </button>
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
                <label className="text-sm font-medium">Body (plain text — blank lines start new paragraphs)</label>
                <textarea
                  required
                  rows={16}
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-xs"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Saving…" : "Save"}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
