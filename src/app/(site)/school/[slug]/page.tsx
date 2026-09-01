import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { courseService, batchService } from "@/server/modules/school/service";
import { getCurrentUser } from "@/server/auth/guards";
import { Card, Badge } from "@/components/ui/card";
import { BookSchoolWidget } from "@/components/site/book-school-widget";
import { DetailSplit } from "@/components/site/detail-split";
import { ReviewsSection } from "@/components/site/reviews-section";
import { FaqSection } from "@/components/site/faq-section";
import { formatINR } from "@/lib/format";
import { StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";
import { GradientText } from "@/components/effects/gradient-text";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const course = await courseService.getBySlug(slug);
    return {
      title: `${course.title} — Paragliding School, Bir Billing`,
      description: `${course.title} at Bir Billing's paragliding school. ${course.description.slice(0, 140)}`,
      alternates: { canonical: `/school/${slug}` },
    };
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

  const galleryImages = course.media.length > 0 ? course.media.map((m) => m.url) : ["/placeholder.svg"];

  return (
    <DetailSplit
      images={galleryImages}
      imageAlt={course.title}
      badge={<Badge>{course.level}</Badge>}
      title={course.title}
      subtitle={`${course.location} · ${course.durationDays} days`}
      sidebar={
        <Card className="p-6">
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
      }
    >
      <p className="whitespace-pre-line text-ink">{course.description}</p>

      {syllabus.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Syllabus</h2>
          <StaggerGroup className="relative mt-4 space-y-6" staggerDelay={0.12}>
            <div className="absolute bottom-2 left-[15px] top-2 w-px bg-border" aria-hidden />
            {syllabus.map((item, index) => (
              <StaggerItem key={item.title} className="relative flex gap-4">
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-brand bg-paper text-xs font-bold text-brand">
                  {index + 1}
                </span>
                <div className="pt-0.5">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted">{item.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      )}

      <FaqSection category="SCHOOL" targetId={course.id} />
      <ReviewsSection targetType="SCHOOL" targetId={course.id} />
    </DetailSplit>
  );
}
