// A price + CTA bar pinned to the bottom of the viewport on mobile/tablet
// (hidden at `lg`, where the booking widget already sits in the visible
// sidebar column) — without it, the price/book widget only appeared after
// scrolling past the entire description, gallery, reviews, and FAQ.
export function MobileBookBar({
  price,
  priceUnit,
  ctaLabel = "Book now",
  targetId,
}: {
  price?: string;
  priceUnit?: string;
  ctaLabel?: string;
  targetId: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-paper/95 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4">
        {price ? (
          <div>
            <p className="text-lg font-bold leading-none">{price}</p>
            {priceUnit && <p className="mt-0.5 text-xs text-muted">{priceUnit}</p>}
          </div>
        ) : (
          <span />
        )}
        <a
          href={`#${targetId}`}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}
