import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";
import { Container, Card } from "@/components/ui/card";
import { ModuleHero } from "@/components/site/module-hero";
import { SectionHeader } from "@/components/site/section-header";
import { FaqBlock } from "@/components/site/faq-block";
import { JsonLd, breadcrumbJsonLd } from "@/components/site/json-ld";
import { ScrollReveal, StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";
import { env } from "@/config/env";
import {
  BIR_BILLING_FACTS,
  SEASONS,
  WHY_BIR_BILLING,
  GETTING_THERE,
  WHAT_TO_BRING,
  SEED_FAQS,
} from "@/content/bir-billing";
import { Mountain, CalendarRange, MapPin, Backpack, ShieldCheck, Sparkles } from "lucide-react";

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? "https://glideinbir.vercel.app";

export const metadata: Metadata = {
  title: "Bir Billing Paragliding — The Complete Guide (Season, Safety, How to Get There)",
  description:
    "Everything you need to plan a paragliding trip to Bir Billing: the flying season and best months, who can fly, what to wear, how to reach Bir from Delhi or Chandigarh, safety, and what a tandem flight is actually like.",
  alternates: { canonical: "/bir-billing" },
};

const guideFaqs = SEED_FAQS.filter((f) => f.category === "GENERAL" || f.category === "PARAGLIDING").map(
  (f) => ({ question: f.question, answer: f.answer }),
);

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Bir Billing Paragliding — The Complete Guide",
  about: "Paragliding in Bir Billing, Himachal Pradesh",
  author: { "@type": "Organization", name: "Glideinbir" },
  publisher: { "@type": "Organization", name: "Glideinbir" },
  mainEntityOfPage: `${siteUrl}/bir-billing`,
};

export default function BirBillingGuidePage() {
  return (
    <>
      <ModuleHero
        image="https://images.unsplash.com/photo-1506976697767-6c29c943ecbf?q=80&w=1920&h=1080&auto=format&fit=crop"
        imageAlt="A paraglider high above the green Bir Billing valley"
        eyebrow="Bir Billing, Himachal Pradesh"
        title="The Bir Billing paragliding guide"
        subtitle="India's home of paragliding — a stable ridge, a 1,000-metre drop and 200+ flyable days a year. Here is everything you need to plan the trip."
        highlights={["World Cup site (2015)", "Season: mid-Sep to Jun", "No experience needed"]}
        effect="dust"
      />

      {/* Facts band */}
      <div className="border-b border-border bg-surface">
        <Container className="grid grid-cols-2 gap-6 py-12 md:grid-cols-5">
          {BIR_BILLING_FACTS.map((f) => (
            <div key={f.label}>
              <div className="text-2xl font-bold tracking-tight text-brand">{f.value}</div>
              <div className="mt-1 text-sm font-medium">{f.label}</div>
              {f.note && <div className="mt-0.5 text-xs text-muted">{f.note}</div>}
            </div>
          ))}
        </Container>
      </div>

      {/* Why */}
      <Container className="py-16">
        <ScrollReveal>
          <SectionHeader eyebrow="Why here" icon={Sparkles} title="What makes Bir Billing special" />
        </ScrollReveal>
        <StaggerGroup className="mt-8 grid gap-6 md:grid-cols-3">
          {WHY_BIR_BILLING.map((item) => (
            <StaggerItem key={item.title}>
              <Card className="h-full p-6">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.body}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>

      {/* Season */}
      <div className="border-y border-border bg-surface">
        <Container className="py-16">
          <ScrollReveal>
            <SectionHeader
              eyebrow="When to come"
              icon={CalendarRange}
              title="The flying season, month by month"
              description="Bir Billing closes for the monsoon. Outside it, flying is possible most days — the table below is the pattern, not a promise for any single day."
            />
          </ScrollReveal>
          <div className="mt-8 overflow-hidden rounded-2xl border border-border">
            {SEASONS.map((s, i) => (
              <div
                key={s.window}
                className={`grid gap-2 p-5 sm:grid-cols-[10rem_7rem_1fr] sm:items-baseline ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="font-semibold">{s.window}</div>
                <div className="text-sm font-medium text-brand">{s.label}</div>
                <div className="text-sm text-muted">{s.detail}</div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Who can fly / what to bring */}
      <Container className="grid gap-12 py-16 md:grid-cols-2">
        <ScrollReveal>
          <SectionHeader eyebrow="Before you book" icon={ShieldCheck} title="Who can fly" />
          <div className="mt-6 space-y-4 text-sm text-muted">
            <p>
              A <strong className="text-ink">tandem flight needs no experience or training</strong>. You are
              harnessed in next to a licensed pilot who runs, flies and lands the wing.
            </p>
            <p>
              Age and weight limits <strong className="text-ink">vary by operator and package</strong> and are
              listed on each package page. As a rough guide, most accept passengers from about{" "}
              <strong className="text-ink">12 years</strong> and between roughly{" "}
              <strong className="text-ink">30 and 90 kg</strong>. Tell the operator in advance about a recent
              injury, heart condition, or pregnancy.
            </p>
            <p>Flights only run when the pilot judges the weather safe — a rescheduled slot is the system working.</p>
          </div>
          <LinkButton href="/paragliding" className="mt-6">
            See flight packages
          </LinkButton>
        </ScrollReveal>

        <ScrollReveal>
          <SectionHeader eyebrow="Packing" icon={Backpack} title="What to wear and bring" />
          <ul className="mt-6 space-y-3 text-sm">
            {WHAT_TO_BRING.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <span className="text-muted">{item}</span>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </Container>

      {/* Getting there */}
      <div className="border-y border-border bg-surface">
        <Container className="py-16">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Getting to Bir"
              icon={MapPin}
              title="How to reach Bir Billing"
              description="Almost everyone stays in Bir village, near the landing field. Billing, the takeoff, is a 40-minute drive above it."
            />
          </ScrollReveal>
          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-paper">
            {GETTING_THERE.map((r, i) => (
              <div
                key={r.from}
                className={`grid gap-1 p-5 sm:grid-cols-[9rem_1fr_12rem] sm:items-baseline ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="font-semibold">{r.from}</div>
                <div className="text-sm text-muted">{r.how}</div>
                <div className="text-sm font-medium sm:text-right">{r.time}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">
            Booking the bus or a taxi through us puts it in the same checkout as your flight —{" "}
            <a href="/travel" className="font-medium text-brand hover:underline">
              see travel options
            </a>
            .
          </p>
        </Container>
      </div>

      {/* What a flight is like */}
      <Container className="py-16">
        <ScrollReveal>
          <SectionHeader eyebrow="On the day" icon={Mountain} title="What a tandem flight is actually like" />
          <div className="mt-6 max-w-2xl space-y-4 text-sm text-muted">
            <p>
              You are driven up to Billing at ~2,400 m. The pilot lays out the wing, clips you into the front of
              the harness and checks the lines. When a clean cycle of wind comes through, you both run a few
              steps down the slope — and then the ground drops away.
            </p>
            <p>
              For the next 15–30 minutes you sit back in the harness and watch the Dhauladhar range on one side
              and the valley unrolling on the other. If the air is buoyant the pilot may catch a thermal and
              spiral up; ask beforehand for a gentle flight if you would rather not. The landing in Bir is a
              short, standing jog onto a flat field.
            </p>
            <p>Add a GoPro to your package if you want the video — the pilot films on a wing-side pole.</p>
          </div>
        </ScrollReveal>
      </Container>

      {/* FAQ */}
      <div className="border-t border-border bg-surface">
        <Container className="py-16">
          <FaqBlock items={guideFaqs} title="Bir Billing paragliding — FAQ" />
        </Container>
      </div>

      {/* CTA */}
      <Container className="py-20 text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Ready to plan it?</h2>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Flights, courses, stays, treks and travel — pick what you want and check out once.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <LinkButton href="/paragliding" size="lg">
            Book a flight
          </LinkButton>
          <LinkButton href="/courses" variant="ghost" size="lg">
            Explore courses
          </LinkButton>
        </div>
      </Container>

      <JsonLd data={[articleJsonLd, breadcrumbJsonLd(siteUrl, [
        { name: "Home", path: "/" },
        { name: "Bir Billing guide", path: "/bir-billing" },
      ])]} />
    </>
  );
}
