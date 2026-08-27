import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/card";
import { ScrollReveal } from "@/components/effects/scroll-reveal";

// Shared detail-page shell: a full-width header (badge/title/meta) on top,
// then a plain two-column row below it — image + description on the left,
// the price/booking card on the right. Deliberately no sticky positioning
// or viewport-height-locked elements here: those caused a nested scrollbar
// inside the column on tall content. Everything scrolls with the page.
export function DetailSplit({
  image,
  imageAlt,
  badge,
  title,
  subtitle,
  children,
  sidebar,
}: {
  image: string;
  imageAlt: string;
  badge?: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <Container className="py-10 md:py-14">
      <ScrollReveal>
        {badge}
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </ScrollReveal>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
            <Image src={image} alt={imageAlt} fill className="object-cover" />
          </div>
          <div className="mt-8">{children}</div>
        </div>
        <div>{sidebar}</div>
      </div>
    </Container>
  );
}
