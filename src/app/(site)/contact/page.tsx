import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Container, Card } from "@/components/ui/card";
import { ModuleHero } from "@/components/site/module-hero";
import { ContactForm } from "@/components/site/contact-form";
import { ScrollReveal } from "@/components/effects/scroll-reveal";

export const metadata: Metadata = { title: "Contact" };

const CONTACT_INFO = [
  {
    icon: Phone,
    title: "Call or WhatsApp",
    lines: ["+91 98053 38877"],
    href: "tel:+919805338877",
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["hello@glideinbir.com"],
    href: "mailto:hello@glideinbir.com",
  },
  {
    icon: MapPin,
    title: "Find us",
    lines: ["Bir, Himachal Pradesh", "India"],
  },
  {
    icon: Clock,
    title: "Hours",
    lines: ["9:00 AM – 7:00 PM", "Every day"],
  },
];

export default function ContactPage() {
  return (
    <>
      <ModuleHero
        image="https://images.unsplash.com/photo-1769963608832-cc25836772e1?q=80&w=1920&h=1080&auto=format&fit=crop"
        imageAlt="A paraglider soaring against a forested mountain backdrop near the Bir Billing landing site"
        eyebrow="We're here to help"
        title="Contact"
        subtitle="Questions about a flight, course, stay, adventure, or a booking already made — reach out and we'll get back to you."
        highlights={["+91 98053 38877", "Bir, Himachal Pradesh", "Daily 9 AM – 7 PM"]}
        effect="dust"
      />

      <Container className="py-20">
        <StaggerGrid />

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <ScrollReveal>
            <h2 className="text-2xl font-bold tracking-tight">Send us a message</h2>
            <p className="mt-2 text-sm text-muted">
              Fill this in and we&apos;ll get back to you — or call/WhatsApp us directly for
              anything urgent.
            </p>
            <Card className="mt-8 p-6 shadow-sm md:p-8">
              <ContactForm />
            </Card>
          </ScrollReveal>

          <ScrollReveal direction="left">
            <Card className="overflow-hidden">
              <div className="relative h-64 w-full sm:h-80">
                <iframe
                  title="Bir Billing location"
                  className="h-full w-full border-0"
                  loading="lazy"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=76.68%2C32.02%2C76.76%2C32.08&layer=mapnik&marker=32.0499%2C76.7213"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold">Bir Billing, Himachal Pradesh</h3>
                <p className="mt-2 text-sm text-muted">
                  Launch site at Billing (2,400m) and landing site at Bir (1,500m) — about 70km
                  from Dharamshala and 500km from Delhi.
                </p>
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </Container>
    </>
  );
}

function StaggerGrid() {
  return (
    <ScrollReveal>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CONTACT_INFO.map(({ icon: Icon, title, lines, href }) => {
          const content = (
            <Card className="card-glow-hover h-full p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              {lines.map((line) => (
                <p key={line} className="mt-1 text-sm text-muted">
                  {line}
                </p>
              ))}
            </Card>
          );
          return href ? (
            <a key={title} href={href}>
              {content}
            </a>
          ) : (
            <div key={title}>{content}</div>
          );
        })}
      </div>
    </ScrollReveal>
  );
}
