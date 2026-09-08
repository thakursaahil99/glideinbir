import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogService } from "@/server/modules/blog/service";
import { Container } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ArticleBody } from "@/components/site/article-body";
import { JsonLd, breadcrumbJsonLd } from "@/components/site/json-ld";
import { formatDate } from "@/lib/format";
import { SEED_POSTS } from "@/content/blog";
import { env } from "@/config/env";

const siteUrl = env.NEXT_PUBLIC_SITE_URL;

type Article = {
  title: string;
  excerpt: string;
  body: string;
  publishedAt: Date;
  coverImage: string | null;
};

async function getArticle(slug: string): Promise<Article | null> {
  const post = await blogService.getBySlug(slug).catch(() => null);
  if (post) {
    return {
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      publishedAt: post.publishedAt,
      coverImage: post.coverImage,
    };
  }
  const seed = SEED_POSTS.find((p) => p.slug === slug);
  if (seed) {
    return {
      title: seed.title,
      excerpt: seed.excerpt,
      body: seed.body,
      publishedAt: new Date(seed.publishedAt),
      coverImage: null,
    };
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Blog" };
  return {
    title: `${article.title} — Glideinbir`,
    description: article.excerpt,
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <Container className="max-w-3xl py-16">
      <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: article.title }]} />

      <p className="text-sm text-muted">{formatDate(article.publishedAt)}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{article.title}</h1>
      <p className="mt-3 text-lg text-muted">{article.excerpt}</p>

      {article.coverImage && (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-3xl">
          <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
        </div>
      )}

      <ArticleBody body={article.body} />

      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.excerpt,
            datePublished: article.publishedAt.toISOString(),
            author: { "@type": "Organization", name: "Glideinbir" },
            publisher: { "@type": "Organization", name: "Glideinbir" },
            mainEntityOfPage: `${siteUrl}/blog/${slug}`,
          },
          breadcrumbJsonLd(siteUrl, [
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: article.title, path: `/blog/${slug}` },
          ]),
        ]}
      />
    </Container>
  );
}
