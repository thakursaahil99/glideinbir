import Link from "next/link";
import { Container } from "@/components/ui/card";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/paragliding", label: "Paragliding" },
      { href: "/school", label: "Paragliding School" },
      { href: "/hotels", label: "Hotels" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQs" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of service" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/cancellation-policy", label: "Cancellation & refunds" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="text-xl font-bold tracking-tight">
            Glide<span className="text-brand">in</span>bir
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Tandem paragliding, paragliding courses, and hotel stays in Bir Billing —
            booked in one place.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="text-sm font-semibold">{col.title}</div>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-border py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} Glideinbir. All rights reserved.
      </div>
    </footer>
  );
}
