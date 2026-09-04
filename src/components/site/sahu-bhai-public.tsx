"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SahuBhaiChat } from "@/components/admin/sahu-bhai-chat";
import { SahuBadge, SahuMark } from "@/components/sahu-mark";

// Public-site chat widget. Bottom-left so it never clashes with the
// bottom-right WhatsApp button. Chat-only (no admin tools); free for a few
// messages, then an email is asked for.
export function SahuBhaiPublic() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Chat with Sahu Bhai"
        className="fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-brand to-brand-dark py-2 pl-2 pr-4 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <SahuMark className="h-4 w-4" />
        </span>
        Ask Sahu Bhai
      </button>
    );
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 flex h-[min(34rem,82dvh)] flex-col overflow-hidden rounded-2xl border border-border bg-paper shadow-2xl sm:inset-x-auto sm:left-5 sm:bottom-5 sm:w-[24rem]">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <SahuBadge className="h-7 w-7 rounded-full" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">Sahu Bhai</p>
            <p className="text-[11px] text-muted">Glideinbir assistant</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="rounded-md p-1.5 text-muted transition-colors hover:bg-black/5 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <SahuBhaiChat
        className="flex-1"
        endpoint="/api/sahu"
        storageKey="sahu-bhai:public"
        showModeToggle={false}
        emptyHint="Paragliding, Bir Billing, trip planning — kuch bhi poochho."
      />
    </div>
  );
}
