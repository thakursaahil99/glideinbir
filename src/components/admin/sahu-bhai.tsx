"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { Sparkles, X, Send, Loader2, Trash2 } from "lucide-react";

type Mode = "readonly" | "act";
type Action = { method: string; path: string; status: number; ok: boolean };
type Entry = { role: "user" | "assistant"; content: string; actions?: Action[] };

const STORAGE_KEY = "sahu-bhai:v1";
const HISTORY_CAP = 20;

// Read once at mount (lazy initial state — never setState-in-effect). The
// panel body is closed by default, so the launcher button that SSR renders
// is identical regardless of what's stored — no hydration mismatch.
function loadStored(): { mode: Mode; entries: Entry[] } {
  try {
    const raw = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as { mode?: Mode; entries?: Entry[] };
      return {
        mode: saved.mode === "act" ? "act" : "readonly",
        entries: Array.isArray(saved.entries) ? saved.entries.slice(-HISTORY_CAP) : [],
      };
    }
  } catch {
    /* ignore unreadable storage */
  }
  return { mode: "readonly", entries: [] };
}

export function SahuBhai() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(() => loadStored().mode);
  const [entries, setEntries] = useState<Entry[]>(() => loadStored().entries);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode, entries: entries.slice(-HISTORY_CAP) }),
      );
    } catch {
      /* ignore unwritable storage */
    }
  }, [mode, entries]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setError(null);
    const withUser: Entry[] = [...entries, { role: "user", content: text }];
    setEntries(withUser);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode,
          messages: withUser.slice(-40).map((e) => ({ role: e.role, content: e.content })),
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Something went wrong.");
      } else {
        setEntries((prev) => [
          ...prev,
          { role: "assistant", content: body.data.reply, actions: body.data.actions },
        ]);
      }
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-br from-brand to-brand-dark px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
        >
          <Sparkles className="h-4 w-4" strokeWidth={2.25} />
          Sahu Bhai
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[32rem] w-[24rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-border bg-paper shadow-2xl">
          <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-white">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Sahu Bhai</p>
                <p className="text-[11px] text-muted">Admin assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setEntries([]);
                  setError(null);
                }}
                title="Clear chat"
                className="rounded-md p-1.5 text-muted transition-colors hover:bg-black/5 hover:text-ink"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Close"
                className="rounded-md p-1.5 text-muted transition-colors hover:bg-black/5 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="flex items-center gap-1 border-b border-border bg-surface/60 px-3 py-2 text-xs">
            {(["readonly", "act"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={clsx(
                  "rounded-full px-2.5 py-1 font-medium transition-colors",
                  mode === m ? "bg-brand text-white" : "text-muted hover:bg-black/5",
                )}
              >
                {m === "readonly" ? "Read-only" : "Make changes"}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-muted">
              {mode === "readonly" ? "changes off" : "changes on"}
            </span>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {entries.length === 0 && (
              <p className="mt-6 text-center text-sm text-muted">
                Ask me anything — e.g. “how many paragliding packages are active?” or
                “create a new category called ‘Sunset Flights’”.
              </p>
            )}
            {entries.map((entry, i) => (
              <div
                key={i}
                className={clsx(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  entry.role === "user"
                    ? "ml-auto bg-brand text-white"
                    : "mr-auto bg-surface text-ink",
                )}
              >
                <p className="whitespace-pre-wrap break-words">{entry.content}</p>
                {entry.actions && entry.actions.length > 0 && (
                  <div className="mt-2 space-y-1 border-t border-black/10 pt-2">
                    {entry.actions.map((a, j) => (
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
            {busy && (
              <div className="mr-auto flex items-center gap-2 rounded-2xl bg-surface px-3 py-2 text-sm text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                thinking…
              </div>
            )}
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
          </div>

          <div className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={1}
                placeholder="Ask Sahu Bhai…"
                className="max-h-28 flex-1 resize-none rounded-xl border border-border bg-paper px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={busy || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition-colors hover:bg-brand-dark disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
