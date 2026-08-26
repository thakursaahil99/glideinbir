import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
