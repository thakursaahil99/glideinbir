import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogService } from "@/server/modules/blog/service";
import { Container } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { formatDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await blogService.getBySlug(slug);
    return {
      title: `${post.title} — Glideinbir Blog`,
      description: post.excerpt,
      alternates: { canonical: `/blog/${slug}` },
    };
  } catch {
    return { title: "Blog" };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await blogService.getBySlug(slug).catch(() => null);
  if (!post) notFound();

  const paragraphs = post.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <Container className="max-w-3xl py-16">
      <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />

      <p className="text-sm text-muted">{formatDate(post.publishedAt)}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{post.title}</h1>

      {post.coverImage && (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-3xl">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
        </div>
      )}

      <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink/90">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </Container>
  );
}
