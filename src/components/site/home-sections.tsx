import Link from "next/link";
import { Container, Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { SectionHeader } from "./section-header";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import { HOW_IT_WORKS, BIR_BILLING_FACTS } from "@/content/bir-billing";
import { SEED_POSTS } from "@/content/blog";
import { MousePointerClick, ArrowRight, BookOpen } from "lucide-react";

export function HowItWorks() {
  return (
    <Container className="py-16">
      <ScrollReveal>
        <SectionHeader eyebrow="How it works" icon={MousePointerClick} title="Booked in three steps" />
      </ScrollReveal>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {HOW_IT_WORKS.map((step, i) => (
          <Card key={step.title} className="relative h-full p-6">
            <span className="text-sm font-bold text-brand">0{i + 1}</span>
            <h3 className="mt-2 font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted">{step.body}</p>
          </Card>
        ))}
      </div>
    </Container>
  );
}

export function PlanningGuides() {
  const posts = SEED_POSTS.slice(0, 3);
  return (
    <Container className="py-16">
      <ScrollReveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader eyebrow="Plan the trip" icon={BookOpen} title="Guides worth reading first" />
          <Link href="/blog" className="text-sm font-medium text-brand hover:underline">
            All guides →
          </Link>
        </div>
      </ScrollReveal>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <Card className="h-full p-6 transition-colors hover:border-brand">
              <h3 className="font-semibold group-hover:text-brand">{post.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted">{post.excerpt}</p>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}

export function BirBillingTeaser() {
  return (
    <div className="border-y border-border bg-surface">
      <Container className="py-16">
        <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
          <ScrollReveal>
            <SectionHeader
              eyebrow="New here?"
              title="First time flying in Bir Billing?"
              description="Season dates, who can fly, what to wear, and how to reach Bir from Delhi or Chandigarh — the whole trip, planned in one read."
            />
            <LinkButton href="/bir-billing" className="mt-6">
              Read the Bir Billing guide
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </LinkButton>
          </ScrollReveal>
          <div className="grid grid-cols-2 gap-4">
            {BIR_BILLING_FACTS.slice(0, 4).map((f) => (
              <Link
                key={f.label}
                href="/bir-billing"
                className="rounded-xl border border-border bg-paper p-4 transition-colors hover:border-brand"
              >
                <div className="text-lg font-bold text-brand">{f.value}</div>
                <div className="mt-0.5 text-xs font-medium">{f.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
