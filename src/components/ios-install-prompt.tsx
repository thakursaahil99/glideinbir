"use client";

import { useEffect, useState } from "react";
import { Share, Plus, X } from "lucide-react";
import { SahuBadge } from "@/components/sahu-mark";

const DISMISS_KEY = "sahu-ios-install-dismissed";

// iOS Safari has no JS "install" API — a PWA can only be added via the
// Share menu. This is the next best thing: on an iPhone/iPad that hasn't
// already installed it, a one-time banner that shows the exact two taps.
export function IosInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const nav = navigator as Navigator & { standalone?: boolean };
      const isIos = /iphone|ipad|ipod/i.test(nav.userAgent);
      const standalone =
        nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
      let dismissed = false;
      try {
        dismissed = localStorage.getItem(DISMISS_KEY) === "1";
      } catch {
        /* ignore */
      }
      if (isIos && !standalone && !dismissed) setShow(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (!show) return null;

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[60] border-b border-border bg-paper/95 p-4 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur">
      <div className="mx-auto flex max-w-md items-start gap-3">
        <SahuBadge className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="flex-1 text-sm leading-relaxed">
          <p className="font-semibold">Add Sahu Bhai to your Home Screen</p>
          <p className="mt-1 text-muted">
            1. Tap{" "}
            <Share className="mx-0.5 -mt-0.5 inline h-4 w-4 text-brand" strokeWidth={2.25} /> in
            the Safari bar &nbsp;·&nbsp; 2. Choose{" "}
            <span className="font-medium text-ink">Add to Home Screen</span>{" "}
            <Plus className="-mt-0.5 inline h-4 w-4" strokeWidth={2.25} />
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="rounded-md p-1 text-muted transition-colors hover:bg-black/5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
