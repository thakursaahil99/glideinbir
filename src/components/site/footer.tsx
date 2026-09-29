import Link from "next/link";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { clsx } from "clsx";
import { Container } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { AuroraBackground } from "@/components/effects/aurora-background";
import { NoiseOverlay } from "@/components/effects/noise-overlay";
import { MagneticButton } from "@/components/effects/magnetic-button";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import { MODULE_THEME, type ModuleKey } from "@/lib/module-theme";

const COLUMNS: { title: string; links: { href: string; label: string; theme?: ModuleKey }[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/paragliding", label: "Paragliding", theme: "paragliding" },
      { href: "/courses", label: "Paragliding Courses", theme: "school" },
      { href: "/hotels", label: "Hotels", theme: "hotels" },
      { href: "/adventure", label: "Adventure", theme: "adventure" },
      { href: "/travel", label: "Travel", theme: "travel" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/bir-billing", label: "Bir Billing guide" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQs" },
      { href: "/blog", label: "Blog" },
      { href: "/courses/instructors", label: "Instructors" },
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
    <footer className="border-t border-border">
      <div className="relative overflow-hidden bg-night text-white">
        <AuroraBackground className="opacity-40" />
        <NoiseOverlay opacity={0.05} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
          }}
        />
        <Container className="relative z-10 flex flex-col items-center justify-between gap-8 py-20 text-center md:flex-row md:text-left">
          <ScrollReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              Your seat in the sky is waiting
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
              Ready to <span className="gradient-text">fly?</span>
            </h2>
            <p className="mt-3 max-w-lg text-white/70">
              Book your Bir Billing trip — flights, courses, stays, adventures, and travel, all
              in one place.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <MagneticButton>
              <LinkButton href="/paragliding" size="lg" className="px-8 py-4 text-lg">
                Start planning
                <ArrowRight className="h-5 w-5" />
              </LinkButton>
            </MagneticButton>
          </ScrollReveal>
        </Container>
      </div>

      <div className="bg-surface">
        <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="text-xl font-bold tracking-tight">
              Glide<span className="text-brand">in</span>bir
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Tandem paragliding, courses, stays, adventures, and travel in Bir Billing — booked
              in one place.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <li>
                <a href="tel:+919805338877" className="flex items-center gap-2 text-muted hover:text-ink">
                  <Phone className="h-4 w-4 text-brand" /> +91 98053 38877
                </a>
              </li>
              <li>
                <a href="mailto:hello@glideinbir.com" className="flex items-center gap-2 text-muted hover:text-ink">
                  <Mail className="h-4 w-4 text-brand" /> hello@glideinbir.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted">
                <MapPin className="h-4 w-4 text-brand" /> Bir, Himachal Pradesh
              </li>
            </ul>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-sm font-semibold">{col.title}</div>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => {
                  const theme = link.theme && MODULE_THEME[link.theme];
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={clsx(
                          "flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70",
                          theme ? theme.text : "text-muted hover:text-ink",
                        )}
                      >
                        {theme && <span className={clsx("h-1.5 w-1.5 rounded-full", theme.solid)} />}
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </Container>
        <div className="border-t border-border py-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} Glideinbir. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
