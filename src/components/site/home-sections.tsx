import Link from "next/link";
import Image from "next/image";
import { stockPhoto } from "@/lib/stock-photos";
import { Container } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { SectionHeader } from "./section-header";
import { ScrollReveal, StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";
import { GrowLine } from "@/components/effects/grow-line";
import { SpotlightCard } from "@/components/effects/spotlight-card";
import { CountUp } from "@/components/effects/count-up";
import { HOW_IT_WORKS, BIR_BILLING_FACTS } from "@/content/bir-billing";
import { SEED_POSTS } from "@/content/blog";
import { MousePointerClick, MailCheck, Wind, ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";

const STEP_ICONS = [MousePointerClick, MailCheck, Wind];

export function HowItWorks() {
  return (
    <Container className="py-20">
      <ScrollReveal>
        <SectionHeader
          eyebrow="How it works"
          icon={MousePointerClick}
          title={
            <>
              Booked in <span className="gradient-text">three steps</span>
            </>
          }
          align="center"
        />
      </ScrollReveal>
      <div className="relative mt-14">
        {/* Timeline rule joining the three step nodes (desktop). */}
        <GrowLine className="absolute left-[16.66%] right-[16.66%] top-7 hidden h-0.5 rounded-full bg-gradient-to-r from-brand/20 via-brand to-brand/20 md:block" />
        <StaggerGroup className="grid gap-10 md:grid-cols-3 md:gap-6" staggerDelay={0.18}>
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = STEP_ICONS[i] ?? MousePointerClick;
            return (
              <StaggerItem key={step.title} className="flex flex-col items-center">
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand bg-paper text-brand shadow-lg shadow-brand/20 ring-8 ring-paper">
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <SpotlightCard className="group mt-6 h-full w-full overflow-hidden p-6 text-center transition-transform duration-300 hover:-translate-y-1">
                  <span className="text-outline pointer-events-none absolute -right-1 -top-5 select-none text-8xl font-bold leading-none transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105">
                    0{i + 1}
                  </span>
                  <h3 className="relative font-semibold">{step.title}</h3>
                  <p className="relative mt-2 text-sm text-muted">{step.body}</p>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
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
      <StaggerGroup className="mt-8 grid gap-6 md:grid-cols-3">
        {posts.map((post, i) => (
          <StaggerItem key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="group block h-full">
              <SpotlightCard className="flex h-full flex-col overflow-hidden transition-transform duration-300 group-hover:-translate-y-1">
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={stockPhoto("blog", post.title)}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-3 left-4 text-xs font-semibold uppercase tracking-widest text-white/90">
                    Guide 0{i + 1}
                  </span>
                  <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold transition-colors group-hover:text-brand">{post.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted">{post.excerpt}</p>
                </div>
              </SpotlightCard>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </Container>
  );
}

export function BirBillingTeaser() {
  return (
    <div className="band-ocean border-y border-border">
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
          <StaggerGroup className="grid grid-cols-2 gap-4">
            {BIR_BILLING_FACTS.slice(0, 4).map((f) => (
              <StaggerItem key={f.label}>
                <Link href="/bir-billing" className="group block h-full">
                  <SpotlightCard className="h-full rounded-xl p-5 transition-transform duration-300 group-hover:-translate-y-1">
                    <div className="text-2xl font-bold tabular-nums text-brand">
                      <CountUp value={f.value} />
                    </div>
                    <div className="mt-1 text-xs font-medium">{f.label}</div>
                  </SpotlightCard>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </Container>
    </div>
  );
}
