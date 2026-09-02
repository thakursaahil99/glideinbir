// Lightweight placeholder for a section streamed in via <Suspense> (FAQ,
// reviews) — keeps layout stable while its own DB query is still in
// flight, without blocking the rest of the page (gallery, price, booking
// widget) from being interactive first.
export function SectionSkeleton() {
  return (
    <div className="mt-10 animate-pulse border-t border-border pt-8">
      <div className="h-5 w-40 rounded bg-black/10" />
      <div className="mt-5 space-y-3">
        <div className="h-16 rounded-xl bg-black/5" />
        <div className="h-16 rounded-xl bg-black/5" />
      </div>
    </div>
  );
}
