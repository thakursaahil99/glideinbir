"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { clsx } from "clsx";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// "Install app" button for Chromium (Android Chrome, desktop Chrome/Edge on
// Windows/Mac). iOS is handled separately by <IosInstallPrompt> because
// Safari exposes no install API.
export function PwaInstallButton({ className }: { className?: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

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

  if (installed || !deferred) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => undefined);
    setDeferred(null);
  }

  return (
    <button
      type="button"
      onClick={install}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-black/5",
        className,
      )}
    >
      <Download className="h-3.5 w-3.5" />
      Install app
    </button>
  );
}
