import { getCurrentUser } from "@/server/auth/guards";
import { SiteHeader } from "./header";
import { SiteFooter } from "./footer";
import { WhatsappButton } from "./whatsapp-button";
import { SahuBhaiPublic } from "./sahu-bhai-public";
import { SeasonalOverlay } from "@/components/effects/seasonal-overlay";

export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <>
      <SeasonalOverlay />
      <SiteHeader user={user ? { name: user.name } : null} />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter />
      <WhatsappButton />
      <SahuBhaiPublic />
    </>
  );
}
