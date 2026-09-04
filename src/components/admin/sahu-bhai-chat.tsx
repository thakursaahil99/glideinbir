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
  starters = [],
}: {
  className?: string;
  endpoint?: string;
  storageKey?: string;
  showModeToggle?: boolean;
  emptyHint?: string;
  starters?: string[];
}) {
  const [mode, setMode] = useState<Mode>(() => loadStored(storageKey).mode);
  const [lang, setLang] = useState<Lang>(() => loadStored(storageKey).lang);
  const [entries, setEntries] = useState<Entry[]>(() => loadStored(storageKey).entries);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // When the server asks for an email, we stash the message + the exact
  // history it belongs to so we can resend after the email is captured.
  const [gate, setGate] = useState<{ pending: string; history: Entry[] } | null>(null);
  const [email, setEmail] = useState("");
  // Seconds left on a rate-limit cooldown (0 = none).
  const [cooldown, setCooldown] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const newChatRef = useRef(false);

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

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function newChat() {
    setEntries([]);
    setError(null);
    setGate(null);
    setInput("");
    newChatRef.current = true;
  }

  async function submitEmail(value: string, pending: string, history: Entry[]) {
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
    await deliver(pending, history);
  }

  // `history` already includes the pending user turn. Streams the reply
  // (SSE) into a live assistant entry.
  async function deliver(text: string, history: Entry[]) {
    setBusy(true);
    setError(null);

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...(showModeToggle ? { mode } : {}),
          lang,
          ...(newChatRef.current ? { newChat: true } : {}),
          messages: history.slice(-40).map((e) => ({ role: e.role, content: e.content })),
        }),
      });
      newChatRef.current = false;
    } catch {
      setError("Couldn't reach the server.");
      setBusy(false);
      return;
    }

    // A non-stream error response (auth, rate limit, validation) is JSON.
    if (!res.ok && !res.headers.get("content-type")?.includes("event-stream")) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Something went wrong.");
      if (body?.error?.code === "RATE_LIMITED") setCooldown(20);
      setBusy(false);
      return;
    }

    // Open a live assistant entry to stream into — it lands right after the
    // pending user turn.
    const assistantIndex = history.length;
    setEntries([...history, { role: "assistant", content: "" }]);
    const appendDelta = (delta: string) =>
      setEntries((prev) =>
        prev.map((e, i) => (i === assistantIndex ? { ...e, content: e.content + delta } : e)),
      );
    const setActions = (actions: Action[]) =>
      setEntries((prev) => prev.map((e, i) => (i === assistantIndex ? { ...e, actions } : e)));
    const dropEmptyAssistant = () =>
      setEntries((prev) => prev.filter((e, i) => !(i === assistantIndex && e.content === "")));

    const collectedActions: Action[] = [];
    let streamError: string | null = null;
    let gated = false;

    try {
      const reader = res.body?.getReader();
      if (!reader) throw new Error("no stream");
      const decoder = new TextDecoder();
      let buf = "";
      let event = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("event:")) {
            event = line.slice(6).trim();
            continue;
          }
          if (!line.startsWith("data:")) continue;
          let data: {
            delta?: string;
            message?: string;
            needsEmail?: boolean;
            rateLimited?: boolean;
          } & Action;
          try {
            data = JSON.parse(line.slice(5).trim());
          } catch {
            continue;
          }
          if (event === "text" && data.delta) appendDelta(data.delta);
          else if (event === "action") {
            collectedActions.push(data);
            setActions([...collectedActions]);
          } else if (event === "error") {
            streamError = data.message ?? "Something went wrong.";
            if (data.rateLimited) setCooldown(20);
          } else if (event === "done") {
            if (data.needsEmail) gated = true;
            else setActions([...collectedActions]);
          }
        }
      }
    } catch {
      streamError = streamError ?? "Connection interrupted.";
    }

    setBusy(false);

    if (gated) {
      dropEmptyAssistant();
      const saved = readEmail();
      if (saved) {
        await submitEmail(saved, text, history);
        return;
      }
      setGate({ pending: text, history });
      return;
    }
    if (streamError) {
      dropEmptyAssistant();
      setError(streamError);
    }
  }

  async function sendText(raw: string) {
    const text = raw.trim();
    if (!text || busy || gate || cooldown > 0) return;
    setInput("");
    const withUser: Entry[] = [...entries, { role: "user", content: text }];
    setEntries(withUser);
    await deliver(text, withUser);
  }

  const send = () => sendText(input);

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
          onClick={newChat}
          className="ml-auto rounded-full px-2 py-1 font-medium text-muted hover:bg-black/5"
        >
          New chat
        </button>
      </div>

      <div
        ref={scrollRef}
        className="mx-auto w-full max-w-2xl flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {entries.length === 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted">{emptyHint}</p>
            {starters.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {starters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void sendText(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-ink transition-colors hover:border-brand hover:bg-brand/5"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {entries.map((entry, i) =>
          entry.role === "assistant" && entry.content === "" && !entry.actions?.length ? null : (
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
          ),
        )}
        {busy && entries[entries.length - 1]?.content === "" && (
          <div className="mr-auto flex items-center gap-2 rounded-2xl bg-surface px-3 py-2 text-sm text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            thinking…
          </div>
        )}
        {gate && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) void submitEmail(email.trim(), gate.pending, gate.history);
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
        {cooldown > 0 && (
          <p className="mx-auto mb-2 max-w-2xl text-center text-xs text-muted">
            Rate limited — try again in {cooldown}s
          </p>
        )}
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
            disabled={busy || !input.trim() || !!gate || cooldown > 0}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition-colors hover:bg-brand-dark disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
