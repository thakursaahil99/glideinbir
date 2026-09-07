"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { Mic, PhoneOff, Loader2, X } from "lucide-react";

// Vapi web voice assistant. Renders nothing unless both public env vars are
// set, so the site is unaffected until the owner configures Vapi.
//   NEXT_PUBLIC_VAPI_PUBLIC_KEY   — the "Public Key" from vapi.ai (browser-safe)
//   NEXT_PUBLIC_VAPI_ASSISTANT_ID — the assistant to dial
// The @vapi-ai/web SDK (and its WebRTC dep) is dynamically imported on first
// use so it stays out of the main bundle.
const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

type Phase = "idle" | "connecting" | "live" | "error";

// Minimal shape of the bits of the Vapi instance we touch.
type VapiInstance = {
  start: (assistantId: string) => Promise<unknown>;
  stop: () => void;
  on: (event: string, cb: (...args: unknown[]) => void) => void;
  removeAllListeners?: () => void;
};

export function VapiVoiceButton({
  className,
  label = "Talk",
}: {
  className?: string;
  label?: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const vapiRef = useRef<VapiInstance | null>(null);

  const cleanup = useCallback(() => {
    try {
      vapiRef.current?.removeAllListeners?.();
      vapiRef.current?.stop();
    } catch {
      /* already stopped */
    }
    vapiRef.current = null;
    setAssistantSpeaking(false);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  async function startCall() {
    if (!PUBLIC_KEY || !ASSISTANT_ID) return;
    setPhase("connecting");
    setErrorMsg(null);
    try {
      const mod = await import("@vapi-ai/web");
      const Vapi = mod.default;
      const vapi = new Vapi(PUBLIC_KEY) as unknown as VapiInstance;
      vapiRef.current = vapi;

      vapi.on("call-start", () => setPhase("live"));
      vapi.on("call-end", () => {
        setPhase("idle");
        cleanup();
      });
      vapi.on("speech-start", () => setAssistantSpeaking(true));
      vapi.on("speech-end", () => setAssistantSpeaking(false));
      vapi.on("error", (err: unknown) => {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : "Voice call failed. Check your mic permission and try again.";
        setErrorMsg(message);
        setPhase("error");
        cleanup();
      });

      await vapi.start(ASSISTANT_ID);
    } catch {
      setErrorMsg("Couldn't start the voice assistant. Please try again.");
      setPhase("error");
      cleanup();
    }
  }

  function endCall() {
    cleanup();
    setPhase("idle");
  }

  if (!PUBLIC_KEY || !ASSISTANT_ID) return null;

  const busy = phase === "connecting" || phase === "live";

  return (
    <>
      <button
        type="button"
        onClick={busy ? endCall : () => void startCall()}
        aria-label={busy ? "End voice call" : "Talk to Sahu Bhai"}
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
          busy
            ? "bg-red-600 text-white hover:bg-red-700"
            : "text-muted hover:bg-black/5 hover:text-ink",
          className,
        )}
      >
        {phase === "connecting" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : busy ? (
          <PhoneOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        {busy ? "End" : label}
      </button>

      {busy && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-paper px-4 py-3 shadow-2xl">
            <span className="relative flex h-3 w-3">
              <span
                className={clsx(
                  "absolute inline-flex h-full w-full rounded-full bg-brand opacity-75",
                  assistantSpeaking && "animate-ping",
                )}
              />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-brand" />
            </span>
            <p className="text-sm">
              {phase === "connecting"
                ? "Connecting…"
                : assistantSpeaking
                  ? "Sahu Bhai is speaking…"
                  : "Listening — go ahead"}
            </p>
            <button
              type="button"
              onClick={endCall}
              className="ml-2 flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
            >
              <PhoneOff className="h-3.5 w-3.5" /> End
            </button>
          </div>
        </div>
      )}

      {phase === "error" && errorMsg && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4">
          <div className="flex max-w-sm items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-2xl">
            <p className="flex-1">{errorMsg}</p>
            <button type="button" onClick={() => setPhase("idle")} aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
