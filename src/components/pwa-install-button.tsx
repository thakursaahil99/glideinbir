"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";
import { clsx } from "clsx";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// "Install app" affordance. Uses the Chromium `beforeinstallprompt` flow
// where available (Android/Chrome, desktop Chrome/Edge on Windows), and
// falls back to the manual "Add to Home Screen" hint on iOS Safari.
export function PwaInstallButton({ className }: { className?: string }) {
  const [ready, setReady] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  // Defer the first meaningful render past hydration so server (null) and
  // client (null) match — then the UA/standalone checks run client-only.
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!ready || installed) return null;

  const nav = window.navigator as Navigator & { standalone?: boolean };
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
  if (isStandalone) return null;

  const isIos = /iphone|ipad|ipod/i.test(nav.userAgent);
  // Nothing to offer (e.g. desktop Firefox, or Chrome before the event) —
  // and no manual path — so render nothing.
  if (!deferred && !isIos) return null;

  async function install() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice.catch(() => undefined);
      setDeferred(null);
    } else {
      setShowIosHint((v) => !v);
    }
  }

  return (
    <div className={clsx("text-xs", className)}>
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-medium text-ink transition-colors hover:bg-black/5"
      >
        {isIos && !deferred ? <Share className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
        Install app
      </button>
      {showIosHint && (
        <p className="mt-1.5 text-muted">
          On iPhone/iPad: tap the <span className="font-medium">Share</span> button, then{" "}
          <span className="font-medium">“Add to Home Screen”</span>.
        </p>
      )}
    </div>
  );
}
