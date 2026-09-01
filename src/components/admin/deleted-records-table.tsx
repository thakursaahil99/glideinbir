"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, Badge } from "@/components/ui/card";

type DeletedRecord = {
  id: string;
  entityType: string;
  entityTypeLabel: string;
  entityId: string;
  label: string;
  deletedAt: string;
  deletedBy: { name: string; email: string } | null;
  restoredAt: string | null;
  restoredBy: { name: string; email: string } | null;
  restorable: boolean;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function DeletedRecordsTable() {
  const [records, setRecords] = useState<DeletedRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function load() {
    fetch("/api/admin/audit/deleted")
      .then((res) => res.json())
      .then((body) => setRecords(body.success ? body.data : []));
  }

  useEffect(load, []);

  function handleRestore(record: DeletedRecord) {
    if (!confirm(`Restore "${record.label}" (${record.entityTypeLabel})?`)) return;
    setError(null);
    setRestoringId(record.id);
    startTransition(async () => {
      const res = await fetch(`/api/admin/audit/deleted/${record.id}/restore`, { method: "POST" });
      const body = await res.json();
      setRestoringId(null);
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Could not restore this record.");
        return;
      }
      load();
    });
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-surface text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Deleted by</th>
            <th className="px-4 py-3">Deleted at</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {records?.map((record) => (
            <tr
              key={record.id}
              className="border-b border-border last:border-0 transition-colors hover:bg-black/[0.025]"
            >
              <td className="px-4 py-3">
                <Badge>{record.entityTypeLabel}</Badge>
              </td>
              <td className="px-4 py-3 font-medium">{record.label}</td>
              <td className="px-4 py-3">
                {record.deletedBy ? (
                  <>
                    {record.deletedBy.name}
                    <span className="block text-xs text-muted">{record.deletedBy.email}</span>
                  </>
                ) : (
                  <span className="text-muted">Unknown</span>
                )}
              </td>
              <td className="px-4 py-3 text-muted">{formatDateTime(record.deletedAt)}</td>
              <td className="px-4 py-3">
                {record.restoredAt ? (
                  <Badge className="bg-green-50 text-green-700">
                    Restored{record.restoredBy ? ` by ${record.restoredBy.name}` : ""}
                  </Badge>
                ) : (
                  <Badge className="bg-red-50 text-red-700">Deleted</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {!record.restoredAt && record.restorable && (
                  <button
                    type="button"
                    onClick={() => handleRestore(record)}
                    disabled={isPending && restoringId === record.id}
                    className="rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
                  >
                    {isPending && restoringId === record.id ? "Restoring…" : "Restore"}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {records && records.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted">
                Nothing has been deleted yet.
              </td>
            </tr>
          )}
          {!records && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted">
                Loading…
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {error && <p className="border-t border-border px-4 py-3 text-sm text-red-600">{error}</p>}
    </Card>
  );
}
