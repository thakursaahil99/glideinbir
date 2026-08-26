"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type Field = {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "checkbox" | "url";
  required?: boolean;
  placeholder?: string;
};

export type Column<T> = {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
};

const EMPTY_FORM: Record<string, string | boolean> = {};

// A flat CRUD screen (list + create + edit + delete) for simple entities
// with no nested resources — categories, amenities, instructors. Anything
// with relations (packages, hotels, batches...) gets a bespoke page instead.
export function SimpleEntityManager<T extends { id: string }>({
  apiBase,
  fields,
  columns,
  emptyLabel = "Nothing here yet.",
}: {
  apiBase: string;
  fields: Field[];
  columns: Column<T>[];
  emptyLabel?: string;
}) {
  const [items, setItems] = useState<T[] | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function load() {
    fetch(apiBase)
      .then((res) => res.json())
      .then((body) => setItems(body.success ? body.data : []));
  }

  useEffect(load, [apiBase]);

  function buildPayload() {
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = form[field.name];
      if (field.type === "checkbox") {
        payload[field.name] = Boolean(raw);
      } else if (field.type === "number") {
        if (raw !== undefined && raw !== "") payload[field.name] = Number(raw);
      } else if (raw !== undefined && raw !== "") {
        payload[field.name] = raw;
      }
    }
    return payload;
  }

  function startEdit(item: T) {
    const record = item as unknown as Record<string, unknown>;
    const next: Record<string, string | boolean> = {};
    for (const field of fields) {
      const value = record[field.name];
      next[field.name] = field.type === "checkbox" ? Boolean(value) : ((value as string) ?? "");
    }
    setForm(next);
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
      const payload = buildPayload();
      const url = editingId ? `${apiBase}/${editingId}` : apiBase;
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Could not save.");
        return;
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      load();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await fetch(`${apiBase}/${id}`, { method: "DELETE" });
      if (editingId === id) cancelEdit();
      load();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface text-left text-xs uppercase text-muted">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items?.map((item) => (
              <tr
                key={item.id}
                className={
                  item.id === editingId
                    ? "border-b border-border bg-brand/5 last:border-0"
                    : "border-b border-border last:border-0"
                }
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render(item)}
                  </td>
                ))}
                <td className="px-4 py-3 text-right space-x-3">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    disabled={isPending}
                    className="text-xs font-medium text-brand hover:underline disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={isPending}
                    className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items && items.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted">
                  {emptyLabel}
                </td>
              </tr>
            )}
            {!items && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted">
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card className="h-fit p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{editingId ? "Edit" : "Add new"}</h3>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-xs font-medium text-muted hover:text-ink"
            >
              Cancel
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {fields.map((field) => (
            <div key={field.name}>
              {field.type === "checkbox" ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(form[field.name])}
                    onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.checked }))}
                  />
                  {field.label}
                </label>
              ) : (
                <>
                  <label className="text-sm font-medium">{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      required={field.required}
                      placeholder={field.placeholder}
                      value={(form[field.name] as string) ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                      rows={3}
                    />
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={(form[field.name] as string) ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    />
                  )}
                </>
              )}
            </div>
          ))}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving…" : editingId ? "Save changes" : "Create"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
