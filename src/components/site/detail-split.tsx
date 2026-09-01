import type { ReactNode } from "react";
import { Container } from "@/components/ui/card";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import { PhotoGallery } from "./photo-gallery";
import { MobileBookBar } from "./mobile-book-bar";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

// Shared detail-page shell: a full-width header (badge/title/meta) on top,
// then a plain two-column row below it — photo gallery + description on
// the left, the price/booking card on the right. Deliberately no sticky
// positioning or viewport-height-locked elements here: those caused a
// nested scrollbar inside the column on tall content. Everything scrolls
// with the page.
//
// `price`/`priceUnit` are optional — when given, a bar pinned to the
// bottom of the screen on mobile (where the sidebar column is below all
// the page's content, not beside it) shows the price and jumps straight to
// the booking widget instead of making the visitor scroll past everything.
export function DetailSplit({
  images,
  imageAlt,
  badge,
  title,
  subtitle,
  children,
  sidebar,
  price,
  priceUnit,
  breadcrumbs,
}: {
  images: string[];
  imageAlt: string;
  badge?: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
  sidebar: ReactNode;
  price?: string;
  priceUnit?: string;
  breadcrumbs?: Crumb[];
}) {
  return (
    <>
      <Container className="py-10 md:py-14">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <ScrollReveal>
          {badge}
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </ScrollReveal>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <PhotoGallery images={images} alt={imageAlt} />
            <div className="mt-8">{children}</div>
          </div>
          <div id="book" className="scroll-mt-20">
            {sidebar}
          </div>
        </div>
      </Container>

      {price && (
        <>
          {/* Keeps the fixed bar from covering the page's last content. */}
          <div className="h-20 lg:hidden" />
          <MobileBookBar price={price} priceUnit={priceUnit} targetId="book" />
        </>
      )}
    </>
  );
}
