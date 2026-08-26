import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { courseService, batchService } from "@/server/modules/school/service";
import { getCurrentUser } from "@/server/auth/guards";
import { Card, Container, Badge } from "@/components/ui/card";
import { BookSchoolWidget } from "@/components/site/book-school-widget";
import { formatINR } from "@/lib/format";
import { ScrollReveal, StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";
import { GradientText } from "@/components/effects/gradient-text";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const course = await courseService.getBySlug(slug);
    return { title: course.title };
  } catch {
    return { title: "Paragliding School" };
  }
}

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [course, user] = await Promise.all([
    courseService.getBySlug(slug).catch(() => null),
    getCurrentUser(),
  ]);
  if (!course) notFound();

  const batches = await batchService.listForCourseSlug(slug);
  const syllabus = course.syllabus as { title: string; description: string }[];

  const coverImage = course.media[0]?.url ?? `https://picsum.photos/seed/${course.slug}/1600/900`;

  return (
    <Container className="py-16">
      <div className="relative h-72 w-full overflow-hidden rounded-2xl md:h-96">
        <Image src={coverImage} alt={course.title} fill priority className="object-cover" />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <ScrollReveal>
        <Badge>{course.level}</Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="mt-1 text-sm text-muted">
          {course.location} · {course.durationDays} days
        </p>

        <p className="mt-6 whitespace-pre-line text-ink">{course.description}</p>

        {syllabus.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Syllabus</h2>
            <StaggerGroup className="mt-3 space-y-3" staggerDelay={0.12}>
              {syllabus.map((item, index) => (
                <StaggerItem key={item.title} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted">{item.description}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        )}

        {course.requirements.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Requirements</h2>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted">
              {course.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </ScrollReveal>

      <div>
        <Card className="sticky top-24 p-6">
          <div className="text-2xl font-bold">
            <GradientText>{formatINR(course.fee.toString())}</GradientText>
          </div>
          <p className="text-sm text-muted">per student</p>
          <div className="mt-6">
            <BookSchoolWidget
              courseId={course.id}
              fee={course.fee.toNumber()}
              isLoggedIn={Boolean(user)}
              customer={user ? { name: user.name, email: user.email, phone: user.phone } : undefined}
              batches={batches.map((batch) => ({
                id: batch.id,
                startDate: batch.startDate.toISOString(),
                endDate: batch.endDate.toISOString(),
                maxStudents: batch.maxStudents,
                bookedSeats: batch.bookedSeats,
                instructor: { name: batch.instructor.name },
              }))}
            />
          </div>
        </Card>
      </div>
      </div>
    </Container>
  );
}
