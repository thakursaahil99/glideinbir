import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { searchService } from "@/server/modules/search/service";
import { Card, Container, Badge } from "@/components/ui/card";
import { CardArrow } from "@/components/site/card-arrow";

export const metadata: Metadata = {
  title: "Search — Glideinbir",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchService.search(query) : [];

  return (
    <Container className="py-16">
      <h1 className="text-2xl font-bold tracking-tight">
        {query ? (
          <>
            Search results for <span className="text-brand">&ldquo;{query}&rdquo;</span>
          </>
        ) : (
          "Search"
        )}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {query
          ? `${results.length} result${results.length === 1 ? "" : "s"}`
          : "Search across paragliding, school, hotels, adventure, and travel."}
      </p>

      {query && results.length === 0 && (
        <p className="mt-10 text-muted">
          Nothing matched &ldquo;{query}&rdquo;. Try a shorter or different word, or browse{" "}
          <Link href="/paragliding" className="text-brand hover:underline">
            Paragliding
          </Link>
          ,{" "}
          <Link href="/hotels" className="text-brand hover:underline">
            Hotels
          </Link>
          , or{" "}
          <Link href="/adventure" className="text-brand hover:underline">
            Adventure
          </Link>{" "}
          directly.
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => (
            <Link key={result.href} href={result.href} className="group">
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative h-40 w-full">
                  <Image src={result.image} alt={result.title} fill className="object-cover" />
                  <CardArrow />
                </div>
                <div className="p-5">
                  <Badge>{result.typeLabel}</Badge>
                  <h2 className="mt-2 font-semibold">{result.title}</h2>
                  <p className="mt-1 text-sm text-muted">{result.meta}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
