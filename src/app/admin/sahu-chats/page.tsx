"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { clsx } from "clsx";
import { ArrowLeft, Trash2, Download, Mail } from "lucide-react";
import { Card, Badge } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { TableSearch, matchesSearch } from "@/components/admin/table-search";
import { Markdown } from "@/components/markdown";

type SessionRow = {
  id: string;
  email: string | null;
  userName: string | null;
  isCustomer: boolean;
  origin: string;
  turns: number;
  totalMessages: number;
  createdAt: string;
  lastMessageAt: string;
};

type Stats = {
  total: number;
  thisWeek: number;
  leads: number;
  uniqueEmails: number;
  fromPublic: number;
  fromAdmin: number;
};

type Daily = { date: string; count: number }[];
type TopQuestion = { text: string; count: number };

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

type Filter = "all" | "leads" | "admin";

function whoLabel(s: { email: string | null; userName: string | null }) {
  return s.userName ?? s.email ?? "Anonymous";
}

export default function AdminSahuChatsPage() {
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [daily, setDaily] = useState<Daily>([]);
  const [topQuestions, setTopQuestions] = useState<TopQuestion[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      sessions
        ?.filter((s) =>
          filter === "leads"
            ? s.origin === "public" && s.email
            : filter === "admin"
              ? s.origin === "admin"
              : true,
        )
        .filter((s) => matchesSearch(s, search)),
    [sessions, search, filter],
  );

  function loadList() {
    fetch("/api/admin/sahu-chats")
      .then((r) => r.json())
      .then((b) => {
        if (b.success) {
          setSessions(b.data.sessions);
          setStats(b.data.stats);
          setDaily(b.data.daily ?? []);
          setTopQuestions(b.data.topQuestions ?? []);
        } else {
          setSessions([]);
        }
      });
  }

  useEffect(loadList, []);

  function open(id: string) {
    setOpenId(id);
    setTranscript(null);
    fetch(`/api/admin/sahu-chats/${id}`)
      .then((r) => r.json())
      .then((b) => b.success && setTranscript(b.data));
  }

  async function exportCsv() {
    const res = await fetch("/api/admin/sahu-chats/export");
    if (!res.ok) return;
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = `sahu-bhai-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
              <div className="flex items-center gap-2">
                {transcript.email && transcript.origin === "public" && (
                  <a
                    href={`mailto:${transcript.email}`}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-brand hover:bg-brand/10"
                  >
                    <Mail className="h-3.5 w-3.5" /> Email
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => remove(transcript.id)}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
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
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sahu Bhai — chat history</h1>
          <p className="mt-1 text-sm text-muted">
            Every conversation, from the public website and the admin panel — one row per
            visitor / login.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void exportCsv()}
          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-black/5"
        >
          <Download className="h-3.5 w-3.5" /> Export leads (CSV)
        </button>
      </div>

      {stats && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Conversations", stats.total],
            ["This week", stats.thisWeek],
            ["Leads (email)", stats.leads],
            ["Unique emails", stats.uniqueEmails],
            ["From site", stats.fromPublic],
            ["From admin", stats.fromAdmin],
          ].map(([label, value]) => (
            <Card key={label} className="p-3">
              <p className="text-lg font-bold">{value}</p>
              <p className="text-[11px] text-muted">{label}</p>
            </Card>
          ))}
        </div>
      )}

      {(daily.length > 0 || topQuestions.length > 0) && (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {daily.length > 0 && (
            <Card className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                New conversations · last 14 days
              </p>
              <div className="mt-3 flex h-24 items-end gap-1">
                {daily.map((d) => {
                  const max = Math.max(1, ...daily.map((x) => x.count));
                  return (
                    <div
                      key={d.date}
                      title={`${d.date}: ${d.count}`}
                      className="flex-1 rounded-t bg-brand/70"
                      style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
                    />
                  );
                })}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted">
                <span>{daily[0]?.date.slice(5)}</span>
                <span>{daily[daily.length - 1]?.date.slice(5)}</span>
              </div>
            </Card>
          )}
          {topQuestions.length > 0 && (
            <Card className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                What people ask (public)
              </p>
              <ol className="mt-2 space-y-1 text-sm">
                {topQuestions.map((q) => (
                  <li key={q.text} className="flex items-start gap-2">
                    <span className="text-muted">{q.count}×</span>
                    <span className="min-w-0 flex-1 truncate">{q.text}</span>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(["all", "leads", "admin"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
              filter === f ? "bg-brand text-white" : "text-muted hover:bg-black/5",
            )}
          >
            {f === "leads" ? "Leads only" : f}
          </button>
        ))}
        <div className="ml-auto w-full sm:w-64">
          <TableSearch value={search} onChange={setSearch} placeholder="Search by email, name…" />
        </div>
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
                <td className="px-4 py-3">
                  <span className="font-medium">{whoLabel(s)}</span>
                  {s.isCustomer && (
                    <Badge tone="success" className="ml-2 align-middle">
                      Customer
                    </Badge>
                  )}
                </td>
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
                  {search || filter !== "all" ? "No matches." : "No conversations yet."}
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
