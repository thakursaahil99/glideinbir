import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import QRCode from "qrcode";
import { ArrowRight } from "lucide-react";
import { env } from "@/config/env";
import { SahuBadge } from "@/components/sahu-mark";
import { PwaInstallButton } from "@/components/pwa-install-button";
import { ShareAppButton } from "@/components/share-app-button";

export const metadata: Metadata = {
  title: { absolute: "Get the Sahu Bhai app" },
  description:
    "Install Sahu Bhai — the Glideinbir assistant — on your phone. One tap on Android, Share → Add to Home Screen on iPhone.",
};

// A shareable landing page for installing the Sahu Bhai PWA. Send someone the
// link (or the QR code) and they can add the app to their phone without
// hunting through the website.
export default async function GetAppPage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const base = host ? `${proto}://${host}` : env.NEXT_PUBLIC_SITE_URL;
  const appUrl = `${base}/app`;

  const qrSvg = await QRCode.toString(appUrl, {
    type: "svg",
    margin: 1,
    width: 220,
    errorCorrectionLevel: "M",
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-6 px-5 py-12 text-center">
      <SahuBadge className="h-20 w-20 rounded-3xl shadow-lg" />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Get Sahu Bhai on your phone</h1>
        <p className="mt-2 text-sm text-muted">
          Your Glideinbir assistant — ask about paragliding, plan a trip, check prices, or get
          full help once you add your email. Installs like a normal app, works offline.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-border bg-surface p-5">
        <PwaInstallButton className="flex flex-col items-center" />
        <p className="mt-3 text-xs text-muted">
          <span className="font-medium text-ink">iPhone:</span> tap Share, then “Add to Home
          Screen”.
          <br />
          <span className="font-medium text-ink">Android:</span> tap “Install app” above, or
          your browser menu → “Add to Home screen”.
        </p>
      </div>

      <Link
        href="/sahu"
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-brand to-brand-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
      >
        Open Sahu Bhai <ArrowRight className="h-4 w-4" />
      </Link>

      <div className="flex flex-col items-center gap-3">
        <div
          className="rounded-xl border border-border bg-white p-3"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <p className="text-xs text-muted">Scan to open this page on your phone</p>
        <ShareAppButton url={appUrl} />
      </div>

      <Link href="/" className="text-xs text-muted hover:text-ink">
        ← Back to glideinbir.com
      </Link>
    </main>
  );
}
