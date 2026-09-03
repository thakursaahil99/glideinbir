"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, X, Maximize2 } from "lucide-react";
import { SahuBhaiChat } from "@/components/admin/sahu-bhai-chat";
import { PwaInstallButton } from "@/components/pwa-install-button";

// Floating launcher + slide-up panel. The chat itself lives in
// <SahuBhaiChat> so the installable full-screen page at /sahu can reuse it.
export function SahuBhai() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-brand to-brand-dark px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
      >
        <Sparkles className="h-4 w-4" strokeWidth={2.25} />
        Sahu Bhai
      </button>
    );
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 flex h-[min(32rem,80dvh)] flex-col overflow-hidden rounded-2xl border border-border bg-paper shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[24rem]">
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
          <Link
            href="/sahu"
            title="Open full screen"
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-black/5 hover:text-ink"
          >
            <Maximize2 className="h-4 w-4" />
          </Link>
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

      <SahuBhaiChat className="flex-1" />

      <PwaInstallButton className="border-t border-border px-3 py-2" />
    </div>
  );
}
