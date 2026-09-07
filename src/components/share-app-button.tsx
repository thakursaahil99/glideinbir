"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

// "Send it to someone": native share sheet on mobile, copy-to-clipboard
// everywhere else. `url` is the absolute /app link, resolved on the server.
export function ShareAppButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function onClick() {
    if (canShare) {
      try {
        await navigator.share({ title: "Sahu Bhai", text: "Install the Sahu Bhai app", url });
        return;
      } catch {
        /* user cancelled or share failed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — nothing else we can do */
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-black/5"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-emerald-600" /> Link copied
        </>
      ) : canShare ? (
        <>
          <Share2 className="h-4 w-4" /> Share link
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4" /> Copy link
        </>
      )}
    </button>
  );
}
