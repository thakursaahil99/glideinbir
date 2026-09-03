"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";
import { clsx } from "clsx";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Always-visible "Install app" affordance (until the app is actually
// installed / running standalone). If the browser gave us a deferred
// prompt (Android/desktop Chrome & Edge) we fire it; otherwise we show the
// manual path for that platform, so there's always a way forward.
export function PwaInstallButton({ className }: { className?: string }) {
  const [ready, setReady] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [hint, setHint] = useState<"ios" | "menu" | null>(null);

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
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
  if (standalone) return null;

  const isIos = /iphone|ipad|ipod/i.test(nav.userAgent);

  async function handleClick() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice.catch(() => undefined);
      setDeferred(null);
      return;
    }
    setHint(isIos ? "ios" : "menu");
  }

  return (
    <div className={clsx("text-xs", className)}>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-medium text-ink transition-colors hover:bg-black/5"
      >
        {isIos ? <Share className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
        Install app
      </button>
      {hint === "ios" && (
        <p className="mt-1.5 text-muted">
          In Safari: tap <span className="font-medium">Share</span>, then{" "}
          <span className="font-medium">“Add to Home Screen”</span>.
        </p>
      )}
      {hint === "menu" && (
        <p className="mt-1.5 text-muted">
          Open your browser menu (<span className="font-medium">⋮</span> or{" "}
          <span className="font-medium">Share</span>) and choose{" "}
          <span className="font-medium">“Install app”</span> /{" "}
          <span className="font-medium">“Add to Home screen”</span>.
        </p>
      )}
    </div>
  );
}
