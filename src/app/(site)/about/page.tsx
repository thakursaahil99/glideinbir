import type { Metadata } from "next";
import Link from "next/link";
import { Container, Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ModuleHero } from "@/components/site/module-hero";
import { SectionHeader } from "@/components/site/section-header";
import { Heart } from "lucide-react";
import { ScrollReveal, StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";

export const metadata: Metadata = {
  title: "About Glideinbir — Bir Billing Paragliding Platform",
  description:
    "Glideinbir is a Bir Billing-based platform for booking paragliding flights, courses, hotels, adventures, and travel in Himachal Pradesh — built and run by people who work out of Bir.",
  alternates: { canonical: "/about" },
};

const STATS = [
  { value: "5", label: "Modules, one checkout" },
  { value: "10,000+", label: "Flights flown" },
  { value: "500+", label: "Pilots certified" },
  { value: "4.8/5", label: "Average rating" },
];

const VALUES = [
  {
    title: "Local, hands-on",
    description: "Built and run out of Bir Billing itself, working directly with the pilots, instructors, and hosts on the ground — not a booking aggregator sitting elsewhere.",
  },
  {
    title: "Safety first",
    description: "Every flight and course on the platform runs through BPA-certified pilots and instructors. We don't list operators we wouldn't fly with ourselves.",
  },
  {
    title: "Transparent pricing",
    description: "The price you see is the price you pay — no surprise add-ons at checkout, no separate calls to \"confirm the real rate.\"",
  },
  {
    title: "One booking, everything",
    description: "Flights, courses, hotel rooms, adventures, and travel — all in a single checkout, so planning a Bir Billing trip doesn't mean juggling five different operators.",
  },
];

export default function AboutPage() {
  return (
    <>
      <ModuleHero
        image="https://images.unsplash.com/photo-1687693656699-44f0e8f2afbc?q=80&w=1920&h=1080&auto=format&fit=crop"
        imageAlt="Visitors relaxing at the Bir Billing paragliding landing site as a paraglider descends"
        eyebrow="Our story"
        title="About Glideinbir"
        subtitle="A single home for everything a Bir Billing trip needs — flights, courses, stays, adventures, and travel — built by people who actually work out of Bir."
        effect="dust"
      />

      <Container className="py-20">
        <ScrollReveal>
          <div className="grid gap-12 md:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Why we built this</h2>
              <p className="mt-4 text-muted">
                Bir Billing is one of the best paragliding sites in the world, but booking a trip
                here has always meant juggling half a dozen separate contacts — a pilot for the
                flight, a school for the course, a guesthouse for the stay, someone else again for
                camping or a trek, and a bus or taxi operator on top of all of it.
              </p>
              <p className="mt-4 text-muted">
                Glideinbir was founded by <strong className="text-ink">Sahil Thakur</strong> to fix
                that: one platform where you can see real availability, real pricing, and book
                everything — paragliding, the school, hotels, adventures like camping and trekking,
                and Volvo bus or taxi transport — in a single checkout.
              </p>
              <p className="mt-4 text-muted">
                We&apos;re still growing the platform module by module, but the goal hasn&apos;t
                changed: make planning a Bir Billing trip as simple as it should be.
              </p>
              <div className="mt-8">
                <LinkButton href="/contact">Get in touch</LinkButton>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {STATS.map((stat) => (
                <Card key={stat.label} className="p-6">
                  <div className="text-3xl font-bold text-brand">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </Container>

      <div className="border-y border-border bg-surface py-20">
        <Container>
          <ScrollReveal>
            <SectionHeader eyebrow="Our principles" icon={Heart} title="What we stand for" align="center" />
          </ScrollReveal>
          <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2">
            {VALUES.map((value) => (
              <StaggerItem key={value.title}>
                <Card className="card-glow-hover h-full p-6">
                  <h3 className="font-semibold">{value.title}</h3>
                  <p className="mt-2 text-sm text-muted">{value.description}</p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </div>

      <Container className="py-20 text-center">
        <ScrollReveal>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Ready to plan your trip?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Browse flights, courses, stays, adventures, and travel — or reach out if you&apos;d
            rather talk it through first.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <LinkButton href="/paragliding">Explore Glideinbir</LinkButton>
            <Link href="/contact" className="text-sm font-medium text-brand hover:underline">
              Contact us →
            </Link>
          </div>
        </ScrollReveal>
      </Container>
    </>
  );
}
