"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { Send, Loader2 } from "lucide-react";
import { Markdown } from "@/components/markdown";

type Mode = "readonly" | "act";
type Lang = "en" | "hi";
type Action = { method: string; path: string; status: number; ok: boolean };
type Entry = { role: "user" | "assistant"; content: string; actions?: Action[] };

const EMAIL_KEY = "sahu-bhai:email";

function loadStored(key: string): { mode: Mode; lang: Lang; entries: Entry[] } {
  try {
    const raw = typeof window !== "undefined" && localStorage.getItem(key);
    if (raw) {
      const saved = JSON.parse(raw) as { mode?: Mode; lang?: Lang; entries?: Entry[] };
      return {
        mode: saved.mode === "act" ? "act" : "readonly",
        lang: saved.lang === "hi" ? "hi" : "en",
        entries: Array.isArray(saved.entries) ? saved.entries.slice(-20) : [],
      };
    }
  } catch {
    /* ignore unreadable storage */
  }
  return { mode: "readonly", lang: "en", entries: [] };
}

function readEmail(): string | null {
  try {
    return localStorage.getItem(EMAIL_KEY);
  } catch {
    return null;
  }
}

// The chat itself — transcript + composer. Shared by the admin panel, the
// installable /sahu page, and the public-site widget.
export function SahuBhaiChat({
  className,
  endpoint = "/api/admin/assistant",
  storageKey = "sahu-bhai:v1",
  showModeToggle = true,
  emptyHint = "Ask me anything — admin work, or general questions.",
}: {
  className?: string;
  endpoint?: string;
  storageKey?: string;
  showModeToggle?: boolean;
  emptyHint?: string;
}) {
  const [mode, setMode] = useState<Mode>(() => loadStored(storageKey).mode);
  const [lang, setLang] = useState<Lang>(() => loadStored(storageKey).lang);
  const [entries, setEntries] = useState<Entry[]>(() => loadStored(storageKey).entries);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gate, setGate] = useState<{ pending: string } | null>(null);
  const [email, setEmail] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  // Latest entries, readable synchronously right after setEntries().
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ mode, lang, entries: entries.slice(-20) }));
    } catch {
      /* ignore */
    }
  }, [mode, lang, entries, storageKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries, busy, gate]);

  async function callApi(history: Entry[]) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...(showModeToggle ? { mode } : {}),
        lang,
        messages: history.slice(-40).map((e) => ({ role: e.role, content: e.content })),
      }),
    });
    return { res, body: await res.json() };
  }

  async function submitEmail(value: string, pending: string) {
    const res = await fetch("/api/sahu/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: value }),
    });
    const body = await res.json();
    if (!res.ok || !body.success) {
      setError(body.error?.message ?? "Couldn't save that email.");
      return;
    }
    try {
      localStorage.setItem(EMAIL_KEY, value);
    } catch {
      /* ignore */
    }
    setGate(null);
    setEmail("");
    await deliver(pending);
  }

  // Send `text` (already added as a user entry) and handle the reply / gate.
  async function deliver(text: string) {
    setBusy(true);
    setError(null);
    try {
      const withUser = entriesRef.current;
      const { res, body } = await callApi(withUser);
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Something went wrong.");
      } else if (body.data.needsEmail) {
        const saved = readEmail();
        if (saved) {
          await submitEmail(saved, text);
          return;
        }
        setGate({ pending: text });
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

  async function send() {
    const text = input.trim();
    if (!text || busy || gate) return;
    setInput("");
    const withUser: Entry[] = [...entries, { role: "user", content: text }];
    setEntries(withUser);
    entriesRef.current = withUser;
    await deliver(text);
  }

  return (
    <div className={clsx("flex min-h-0 flex-col", className)}>
      <div className="flex items-center gap-1 border-b border-border bg-surface/60 px-3 py-2 text-xs">
        {showModeToggle &&
          (["readonly", "act"] as const).map((m) => (
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

        <div className="flex items-center rounded-full bg-black/5 p-0.5">
          {(["en", "hi"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              title={l === "en" ? "Reply in English" : "Reply in Hindi / Hinglish"}
              className={clsx(
                "rounded-full px-2 py-0.5 font-medium transition-colors",
                lang === l ? "bg-brand text-white" : "text-muted hover:text-ink",
              )}
            >
              {l === "en" ? "EN" : "हिं"}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setEntries([]);
            setError(null);
            setGate(null);
          }}
          className="ml-auto rounded-full px-2 py-1 font-medium text-muted hover:bg-black/5"
        >
          Clear
        </button>
      </div>

      <div
        ref={scrollRef}
        className="mx-auto w-full max-w-2xl flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {entries.length === 0 && (
          <p className="mt-6 text-center text-sm text-muted">{emptyHint}</p>
        )}
        {entries.map((entry, i) => (
          <div
            key={i}
            className={clsx(
              "rounded-2xl px-3 py-2 text-sm",
              entry.role === "user"
                ? "ml-auto max-w-[85%] bg-brand text-white"
                : "mr-auto max-w-[92%] bg-surface text-ink",
            )}
          >
            {entry.role === "user" ? (
              <p className="whitespace-pre-wrap break-words">{entry.content}</p>
            ) : (
              <Markdown>{entry.content}</Markdown>
            )}
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
        {gate && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) void submitEmail(email.trim(), gate.pending);
            }}
            className="rounded-xl border border-border bg-paper p-3 text-sm"
          >
            <p className="font-medium">Enter your email to keep chatting.</p>
            <p className="mt-0.5 text-xs text-muted">Just an email — no password, no verification.</p>
            <div className="mt-2 flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </form>
        )}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
      </div>

      <div className="border-t border-border p-3">
        <div className="mx-auto flex w-full max-w-2xl items-end gap-2">
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
            className="max-h-32 flex-1 resize-none rounded-xl border border-border bg-paper px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={busy || !input.trim() || !!gate}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition-colors hover:bg-brand-dark disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
