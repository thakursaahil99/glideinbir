import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { BRAND_COLOR_BOOTSTRAP_SCRIPT } from "@/lib/theme-color";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

// Space Grotesk everywhere — one geometric, wide-letterform, faintly
// futuristic family for both headings and body (Zoqula itself is a paid
// display font with no free commercial license, so this is the closest
// free-for-commercial-use match). Two weight ranges off the same family
// keep the heading/body visual hierarchy Plus Jakarta Sans + Inter used
// to provide, without mixing in a second typeface.
const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
});
const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://glideinbir.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Glideinbir — Paragliding in Bir Billing | Flights, School, Hotels & More",
    template: "%s | Glideinbir — Bir Billing Paragliding",
  },
  description:
    "Book tandem paragliding flights, paragliding courses, hotels, camping, trekking, and Volvo bus or taxi travel in Bir Billing, Himachal Pradesh — India's top paragliding destination. One platform, real-time availability, instant booking.",
  keywords: [
    "paragliding Bir Billing",
    "Bir Billing paragliding",
    "Glideinbir",
    "glide in Bir",
    "paragliding Himachal Pradesh",
    "Bir Billing",
    "Billing paragliding",
    "tandem paragliding India",
    "paragliding school Bir",
    "Bir Billing hotels",
    "Bir Billing trekking",
    "Bir Billing camping",
  ],
  authors: [{ name: "Glideinbir" }],
  creator: "Glideinbir",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Glideinbir",
    title: "Glideinbir — Paragliding in Bir Billing",
    description:
      "Tandem paragliding flights, courses, hotels, adventures, and travel in Bir Billing, Himachal Pradesh — booked in one place.",
    url: siteUrl,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Glideinbir — Paragliding in Bir Billing",
    description:
      "Tandem paragliding flights, courses, hotels, adventures, and travel in Bir Billing, Himachal Pradesh — booked in one place.",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "Glideinbir",
  description:
    "Book tandem paragliding flights, paragliding courses, hotels, camping, trekking, and travel in Bir Billing, Himachal Pradesh.",
  url: siteUrl,
  telephone: "+91-98053-38877",
  email: "hello@glideinbir.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bir",
    addressRegion: "Himachal Pradesh",
    addressCountry: "IN",
  },
  areaServed: {
    "@type": "Place",
    name: "Bir Billing, Himachal Pradesh",
  },
  priceRange: "₹₹",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable}`}
      // The bootstrap script below sets --color-brand/--color-brand-dark
      // inline on this element before hydration, from localStorage, which
      // the server can't know about — that's an intentional mismatch
      // (same pattern next-themes/dark-mode scripts use), not a bug.
      suppressHydrationWarning
    >
      <body className="antialiased">
        {/* Re-applies a color picked from the homepage Rubik's cube before
            first paint, so returning visitors don't see a flash of the
            default brand color. */}
        <script dangerouslySetInnerHTML={{ __html: BRAND_COLOR_BOOTSTRAP_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ToastProvider>{children}</ToastProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
