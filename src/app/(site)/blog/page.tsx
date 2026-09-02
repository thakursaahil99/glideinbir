import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { blogService } from "@/server/modules/blog/service";
import { Card, Container } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";

export const metadata: Metadata = {
  title: "Blog — Bir Billing Travel & Paragliding Guides",
  description: "Guides for planning a Bir Billing trip — when to visit, how to get there, what to pack, and more.",
  alternates: { canonical: "/blog" },
};

export default async function BlogListPage() {
  const posts = await blogService.listPublic();

  return (
    <Container className="py-16">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand">Guides</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Bir Billing travel guides</h1>
      <p className="mt-3 max-w-xl text-muted">Practical guides for planning your trip — before you book.</p>

      {posts.length === 0 ? (
        <p className="mt-12 text-muted">Nothing published yet — check back soon.</p>
      ) : (
        <StaggerGroup className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <StaggerItem key={post.id}>
              <Link href={`/blog/${post.slug}`} className="group">
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                  {post.coverImage && (
                    <div className="relative h-44 w-full">
                      <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-xs text-muted">{formatDate(post.publishedAt)}</p>
                    <h2 className="mt-2 text-lg font-semibold">{post.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
                  </div>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </Container>
  );
}
