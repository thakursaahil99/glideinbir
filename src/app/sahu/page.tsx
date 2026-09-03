import Link from "next/link";
import { Sparkles } from "lucide-react";
import { SahuBhaiChat } from "@/components/admin/sahu-bhai-chat";
import { PwaInstallButton } from "@/components/pwa-install-button";

// Full-screen, installable Sahu Bhai. Same chat as the admin panel, no
// admin chrome — this is the PWA's start_url.
export default function SahuPage() {
  return (
    <>
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-white">
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Sahu Bhai</p>
            <p className="text-[11px] text-muted">Glideinbir assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PwaInstallButton />
          <Link href="/admin" className="text-xs font-medium text-muted hover:text-ink">
            Admin →
          </Link>
        </div>
      </header>

      <SahuBhaiChat className="flex-1" />
    </>
  );
}
