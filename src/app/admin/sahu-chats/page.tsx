"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { clsx } from "clsx";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Card, Badge } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { TableSearch, matchesSearch } from "@/components/admin/table-search";
import { Markdown } from "@/components/markdown";

type SessionRow = {
  id: string;
  email: string | null;
  userName: string | null;
  origin: string;
  turns: number;
  totalMessages: number;
  lastMessageAt: string;
};

type Msg = {
  id: string;
  role: string;
  content: string;
  actions: { method: string; path: string; status: number; ok: boolean }[] | null;
  createdAt: string;
};

type Transcript = {
  id: string;
  email: string | null;
  userName: string | null;
  origin: string;
  messages: Msg[];
};

function whoLabel(s: { email: string | null; userName: string | null }) {
  return s.userName ?? s.email ?? "Anonymous";
}

export default function AdminSahuChatsPage() {
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () => sessions?.filter((s) => matchesSearch(s, search)),
    [sessions, search],
  );

  function loadList() {
    fetch("/api/admin/sahu-chats")
      .then((r) => r.json())
      .then((b) => setSessions(b.success ? b.data : []));
  }

  useEffect(loadList, []);

  function open(id: string) {
    setOpenId(id);
    setTranscript(null);
    fetch(`/api/admin/sahu-chats/${id}`)
      .then((r) => r.json())
      .then((b) => b.success && setTranscript(b.data));
  }

  function remove(id: string) {
    if (!confirm("Delete this conversation permanently?")) return;
    startTransition(async () => {
      await fetch(`/api/admin/sahu-chats/${id}`, { method: "DELETE" });
      if (openId === id) {
        setOpenId(null);
        setTranscript(null);
      }
      loadList();
    });
  }

  // ---- transcript view ----
  if (openId) {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setOpenId(null);
            setTranscript(null);
          }}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> All conversations
        </button>

        {!transcript ? (
          <Card className="mt-4 p-8 text-center text-muted">Loading…</Card>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold tracking-tight">{whoLabel(transcript)}</h1>
                <p className="text-sm text-muted">
                  {transcript.email ?? "no email"} · {transcript.origin}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(transcript.id)}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {transcript.messages.map((m) => (
                <div
                  key={m.id}
                  className={clsx(
                    "rounded-2xl px-3 py-2 text-sm",
                    m.role === "user"
                      ? "ml-auto max-w-[85%] bg-brand text-white"
                      : "mr-auto max-w-[92%] bg-surface text-ink",
                  )}
                >
                  {m.role === "user" ? (
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  ) : (
                    <Markdown>{m.content}</Markdown>
                  )}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-2 space-y-1 border-t border-black/10 pt-2">
                      {m.actions.map((a, j) => (
                        <p
                          key={j}
                          className={clsx(
                            "font-mono text-[10px]",
                            a.ok ? "text-emerald-700" : "text-red-600",
                          )}
                        >
                          {a.method} {a.path} → {a.status}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ---- list view ----
  const withEmail = sessions?.filter((s) => s.email).length ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Sahu Bhai — chat history</h1>
      <p className="mt-1 text-sm text-muted">
        Every conversation with Sahu Bhai, from the public website and the admin panel — one row
        per visitor / login.
        {sessions ? ` ${sessions.length} total · ${withEmail} with an email.` : ""}
      </p>

      <div className="mt-4">
        <TableSearch value={search} onChange={setSearch} placeholder="Search by email, name…" />
      </div>

      <Card className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[44rem] text-sm">
          <thead className="border-b border-border bg-surface text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Who</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Messages</th>
              <th className="px-4 py-3">Last active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered?.map((s) => (
              <tr
                key={s.id}
                className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-black/[0.025]"
                onClick={() => open(s.id)}
              >
                <td className="px-4 py-3 font-medium">{whoLabel(s)}</td>
                <td className="px-4 py-3">
                  <Badge tone={s.origin === "admin" ? "purple" : "neutral"}>{s.origin}</Badge>
                </td>
                <td className="px-4 py-3">{s.totalMessages}</td>
                <td className="px-4 py-3 text-muted">{formatDate(s.lastMessageAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(s.id);
                    }}
                    disabled={isPending}
                    className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {sessions && filtered && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  {search ? "No matches." : "No conversations yet."}
                </td>
              </tr>
            )}
            {!sessions && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
