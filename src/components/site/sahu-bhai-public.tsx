"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SahuBhaiChat } from "@/components/admin/sahu-bhai-chat";
import { SahuBadge, SahuMark } from "@/components/sahu-mark";
import { VoiceButton } from "./voice-button";

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
        // Icon-only round button on mobile (mirrors the WhatsApp button on
        // the opposite corner, clear of the book bar); text pill from sm up.
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark font-semibold text-white shadow-lg transition-transform hover:scale-105 sm:left-5 sm:h-auto sm:w-auto sm:gap-2 sm:py-2 sm:pl-2 sm:pr-4 sm:text-sm lg:bottom-6"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 sm:h-7 sm:w-7">
          <SahuMark className="h-5 w-5 sm:h-4 sm:w-4" />
        </span>
        <span className="hidden sm:inline">Ask Sahu Bhai</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 flex h-[min(34rem,82dvh)] flex-col overflow-hidden rounded-2xl border border-border bg-paper shadow-2xl sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[24rem]">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <SahuBadge className="h-7 w-7 rounded-full" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">Sahu Bhai</p>
            <p className="text-[11px] text-muted">Glideinbir assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <VoiceButton />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-black/5 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <SahuBhaiChat
        className="flex-1"
        endpoint="/api/sahu"
        storageKey="sahu-bhai:public"
        showModeToggle={false}
        emptyHint="Ask about paragliding, Bir Billing, trip planning — anything. Share your email after a few messages to unlock the full assistant and live prices."
        starters={[
          "What paragliding packages do you have?",
          "Best time to visit Bir Billing?",
          "Is tandem paragliding safe?",
          "What should I wear?",
        ]}
      />
    </div>
  );
}
