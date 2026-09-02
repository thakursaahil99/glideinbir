import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { instructorService } from "@/server/modules/school/service";
import { Card, Container, Badge } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Award, Mail, Phone } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const instructor = await instructorService.getBySlug(slug);
    return {
      title: `${instructor.name} — Instructor, Bir Billing Paragliding School`,
      description:
        instructor.bio ?? `${instructor.name}, a paragliding instructor at Bir Billing's paragliding school.`,
      alternates: { canonical: `/school/instructors/${slug}` },
    };
  } catch {
    return { title: "Instructor" };
  }
}

export default async function InstructorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const instructor = await instructorService.getBySlug(slug).catch(() => null);
  if (!instructor) notFound();

  return (
    <Container className="py-12 md:py-16">
      <Breadcrumbs items={[{ label: "School", href: "/school" }, { label: "Instructors", href: "/school/instructors" }, { label: instructor.name }]} />

      <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-surface">
            <Image src={instructor.photoUrl ?? "/placeholder.svg"} alt={instructor.name} fill className="object-cover" />
          </div>
          <div className="mt-4 space-y-2">
            {instructor.contactEmail && (
              <a href={`mailto:${instructor.contactEmail}`} className="flex items-center gap-2 text-sm text-muted hover:text-ink">
                <Mail className="h-4 w-4 text-brand" /> {instructor.contactEmail}
              </a>
            )}
            {instructor.contactPhone && (
              <a href={`tel:${instructor.contactPhone}`} className="flex items-center gap-2 text-sm text-muted hover:text-ink">
                <Phone className="h-4 w-4 text-brand" /> {instructor.contactPhone}
              </a>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{instructor.name}</h1>
          {instructor.experienceYears != null && (
            <p className="mt-1 text-muted">{instructor.experienceYears}+ years of flying experience</p>
          )}

          {instructor.certifications.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {instructor.certifications.map((cert) => (
                <Badge key={cert} className="gap-1">
                  <Award className="h-3.5 w-3.5" />
                  {cert}
                </Badge>
              ))}
            </div>
          )}

          {instructor.bio && <p className="mt-6 whitespace-pre-line text-ink/90">{instructor.bio}</p>}

          <Card className="mt-8 p-6">
            <p className="font-medium">Want to train with {instructor.name.split(" ")[0]}?</p>
            <p className="mt-1 text-sm text-muted">
              Browse courses at the paragliding school — batches list their instructor before you book.
            </p>
            <LinkButton href="/school" className="mt-4">
              View courses
            </LinkButton>
          </Card>
        </div>
      </div>
    </Container>
  );
}
