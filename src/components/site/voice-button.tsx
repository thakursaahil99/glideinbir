"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { Mic, PhoneOff, Loader2, X } from "lucide-react";

// One "Talk" button with two engines:
//   • Vapi  — used when NEXT_PUBLIC_VAPI_PUBLIC_KEY + NEXT_PUBLIC_VAPI_ASSISTANT_ID
//             are set (natural voice, paid after trial credit).
//   • Browser Web Speech API — the free-forever fallback: the browser does
//             speech-to-text and text-to-speech locally, and the reply comes
//             from our own /api/sahu (Gemini). Chrome / Edge / Android work
//             best; iOS Safari is supported but flakier.
const VAPI_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
const VAPI_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
const HAS_VAPI = Boolean(VAPI_KEY && VAPI_ID);

export function VoiceButton({
  endpoint = "/api/sahu",
  className,
}: {
  endpoint?: string;
  className?: string;
}) {
  return HAS_VAPI ? (
    <VapiVoice className={className} />
  ) : (
    <BrowserVoice endpoint={endpoint} className={className} />
  );
}

// ---------------------------------------------------------------- shared UI

function TalkButton({
  busy,
  connecting,
  onClick,
  label,
  className,
}: {
  busy: boolean;
  connecting?: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={busy ? "End voice call" : "Talk to Sahu Bhai"}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
        busy ? "bg-red-600 text-white hover:bg-red-700" : "text-muted hover:bg-black/5 hover:text-ink",
        className,
      )}
    >
      {connecting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : busy ? (
        <PhoneOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      {busy ? "End" : label}
    </button>
  );
}

function CallDock({
  title,
  pulsing,
  transcript,
  onEnd,
}: {
  title: string;
  pulsing: boolean;
  transcript?: string;
  onEnd: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-paper p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span
              className={clsx(
                "absolute inline-flex h-full w-full rounded-full bg-brand opacity-75",
                pulsing && "animate-ping",
              )}
            />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-brand" />
          </span>
          <p className="flex-1 text-sm font-medium">{title}</p>
          <button
            type="button"
            onClick={onEnd}
            className="flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
          >
            <PhoneOff className="h-3.5 w-3.5" /> End
          </button>
        </div>
        {transcript && (
          <p className="mt-2 max-h-24 overflow-y-auto text-xs text-muted [overflow-wrap:anywhere]">
            {transcript}
          </p>
        )}
      </div>
    </div>
  );
}

function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4">
      <div className="flex max-w-sm items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-2xl">
        <p className="flex-1">{message}</p>
        <button type="button" onClick={onClose} aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Vapi engine

type VapiInstance = {
  start: (assistantId: string) => Promise<unknown>;
  stop: () => void;
  on: (event: string, cb: (...args: unknown[]) => void) => void;
  removeAllListeners?: () => void;
};

function VapiVoice({ className }: { className?: string }) {
  const [phase, setPhase] = useState<"idle" | "connecting" | "live" | "error">("idle");
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<VapiInstance | null>(null);

  const cleanup = useCallback(() => {
    try {
      ref.current?.removeAllListeners?.();
      ref.current?.stop();
    } catch {
      /* already stopped */
    }
    ref.current = null;
    setSpeaking(false);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  async function start() {
    if (!VAPI_KEY || !VAPI_ID) return;
    setPhase("connecting");
    setError(null);
    try {
      const Vapi = (await import("@vapi-ai/web")).default;
      const vapi = new Vapi(VAPI_KEY) as unknown as VapiInstance;
      ref.current = vapi;
      vapi.on("call-start", () => setPhase("live"));
      vapi.on("call-end", () => {
        setPhase("idle");
        cleanup();
      });
      vapi.on("speech-start", () => setSpeaking(true));
      vapi.on("speech-end", () => setSpeaking(false));
      vapi.on("error", () => {
        setError("Voice call failed. Check your mic permission and try again.");
        setPhase("error");
        cleanup();
      });
      await vapi.start(VAPI_ID);
    } catch {
      setError("Couldn't start the voice assistant. Please try again.");
      setPhase("error");
      cleanup();
    }
  }

  function end() {
    cleanup();
    setPhase("idle");
  }

  const busy = phase === "connecting" || phase === "live";

  return (
    <>
      <TalkButton
        busy={busy}
        connecting={phase === "connecting"}
        onClick={busy ? end : () => void start()}
        label="Talk"
        className={className}
      />
      {busy && (
        <CallDock
          title={
            phase === "connecting"
              ? "Connecting…"
              : speaking
                ? "Sahu Bhai is speaking…"
                : "Listening — go ahead"
          }
          pulsing={speaking}
          onEnd={end}
        />
      )}
      {phase === "error" && error && (
        <ErrorToast message={error} onClose={() => setPhase("idle")} />
      )}
    </>
  );
}

// ------------------------------------------------ Browser Web Speech engine

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Strip Markdown so the spoken reply doesn't read out "asterisk asterisk".
function forSpeech(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " code block ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_#>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const hasDevanagari = (s: string) => /[ऀ-ॿ]/.test(s);

type BrowserPhase = "idle" | "listening" | "thinking" | "speaking";

function BrowserVoice({ endpoint, className }: { endpoint: string; className?: string }) {
  const [phase, setPhase] = useState<BrowserPhase>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const activeRef = useRef(false); // the user wants the conversation to continue
  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const endpointRef = useRef(endpoint);
  endpointRef.current = endpoint;

  // Plain hoisted functions so listen() ↔ ask() can call each other; all
  // mutable state lives in refs, so a stale closure is never an issue.
  function stopEverything() {
    activeRef.current = false;
    try {
      recRef.current?.abort();
    } catch {
      /* noop */
    }
    recRef.current = null;
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* noop */
    }
    setPhase("idle");
    setTranscript("");
  }

  function speak(text: string, then: () => void) {
    const synth = window.speechSynthesis;
    if (!synth || !text) {
      then();
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    const lang = hasDevanagari(text) ? "hi-IN" : "en-IN";
    utter.lang = lang;
    const voices = synth.getVoices();
    const match =
      voices.find((v) => v.lang === lang) ??
      voices.find((v) => v.lang.startsWith(lang.split("-")[0]!));
    if (match) utter.voice = match;
    utter.onend = then;
    utter.onerror = then;
    setPhase("speaking");
    synth.cancel();
    synth.speak(utter);
  }

  function listen() {
    const Ctor = getRecognitionCtor();
    if (!Ctor || !activeRef.current) return;
    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = true;
    setPhase("listening");
    setTranscript("");

    let finalText = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i]!;
        const chunk = r[0]?.transcript ?? "";
        if (r.isFinal) finalText += chunk;
        else interim += chunk;
      }
      setTranscript(finalText || interim);
    };
    rec.onerror = (ev) => {
      if (ev.error === "no-speech" || ev.error === "aborted") return;
      setError(
        ev.error === "not-allowed"
          ? "Microphone permission is blocked. Allow it in your browser and try again."
          : "Voice input hit a problem. Try again, or use the chat box.",
      );
      stopEverything();
    };
    rec.onend = () => {
      const said = finalText.trim();
      if (!said) {
        if (activeRef.current) listen(); // heard nothing — keep listening
        return;
      }
      if (activeRef.current) void ask(said);
    };

    try {
      rec.start();
    } catch {
      /* start() throws if called twice in a row — ignore */
    }
  }

  async function ask(text: string) {
    setPhase("thinking");
    historyRef.current.push({ role: "user", content: text });

    let reply = "";
    try {
      const res = await fetch(endpointRef.current, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lang: hasDevanagari(text) ? "hi" : "en",
          messages: historyRef.current.slice(-8),
        }),
      });

      if (!res.ok && !res.headers.get("content-type")?.includes("event-stream")) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "The assistant is busy. Try again in a moment.");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let event = "";
      let needsEmail = false;
      while (reader) {
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
          let data: { delta?: string; message?: string; needsEmail?: boolean };
          try {
            data = JSON.parse(line.slice(5).trim());
          } catch {
            continue;
          }
          if (event === "text" && data.delta) {
            reply += data.delta;
            setTranscript(forSpeech(reply));
          } else if (event === "error") {
            throw new Error(data.message ?? "Something went wrong.");
          } else if (event === "done" && data.needsEmail) {
            needsEmail = true;
          }
        }
      }

      if (needsEmail) {
        reply =
          "To keep going, please open the chat window and add your email — just once, no password.";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      stopEverything();
      return;
    }

    const spoken = forSpeech(reply);
    historyRef.current.push({ role: "assistant", content: reply });
    speak(spoken, () => {
      if (activeRef.current) listen();
      else setPhase("idle");
    });
  }

  // Stop audio + recognition if the component unmounts mid-call.
  useEffect(() => {
    return () => stopEverything();
  }, []);

  function start() {
    setError(null);
    if (!getRecognitionCtor()) {
      setError("Voice isn't supported in this browser. Try Chrome, Edge, or the chat box.");
      return;
    }
    try {
      // Prime TTS inside the click gesture — iOS Safari won't speak later
      // (outside a gesture) unless speechSynthesis was touched here first.
      const s = window.speechSynthesis;
      s?.getVoices();
      s?.speak(new SpeechSynthesisUtterance(""));
      s?.cancel();
    } catch {
      /* noop */
    }
    historyRef.current = [];
    activeRef.current = true;
    listen();
  }

  const busy = phase !== "idle";
  const title =
    phase === "listening"
      ? transcript
        ? `“${transcript}”`
        : "Listening — go ahead"
      : phase === "thinking"
        ? "Sahu Bhai is thinking…"
        : phase === "speaking"
          ? "Sahu Bhai is speaking…"
          : "";

  return (
    <>
      <TalkButton
        busy={busy}
        onClick={busy ? stopEverything : start}
        label="Talk"
        className={className}
      />
      {busy && (
        <CallDock
          title={title}
          pulsing={phase === "speaking" || phase === "listening"}
          transcript={phase === "speaking" ? transcript : undefined}
          onEnd={stopEverything}
        />
      )}
      {error && <ErrorToast message={error} onClose={() => setError(null)} />}
    </>
  );
}
