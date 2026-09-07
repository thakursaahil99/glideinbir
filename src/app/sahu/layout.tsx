import type { Metadata, Viewport } from "next";
import { IosInstallPrompt } from "@/components/ios-install-prompt";

// Manifest / apple-web-app tags and the service worker are set site-wide in
// the root layout. `title.absolute` opts out of the root "%s | Glideinbir…"
// template so the tab — and any "Add to Home Screen" shortcut — is just
// "Sahu Bhai".
//
// This page is open to everyone: a signed-in admin gets the admin assistant,
// anyone else (logged out or a customer) gets the public assistant. That's
// what makes the installed app usable straight after "Add to Home Screen"
// without hitting a login wall.
export const metadata: Metadata = {
  title: { absolute: "Sahu Bhai" },
  applicationName: "Sahu Bhai",
};

export const viewport: Viewport = {
  themeColor: "#ff6a00",
};

export default function SahuLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] flex-col bg-paper">
      {children}
      <IosInstallPrompt />
    </div>
  );
}
