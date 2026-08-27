import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { BRAND_COLOR_BOOTSTRAP_SCRIPT } from "@/lib/theme-color";
import "./globals.css";

// Plus Jakarta Sans for headings (distinctive, geometric — replaces the
// browser default that made every section look the same) and Inter for
// body copy (proven readability at small sizes for descriptions/forms).
const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
});
const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "Glideinbir — Paragliding, School & Hotels",
    template: "%s | Glideinbir",
  },
  description:
    "Book tandem paragliding, paragliding courses, and hotel stays with Glideinbir.",
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
        {children}
      </body>
    </html>
  );
}
