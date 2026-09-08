import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { courseService } from "@/server/modules/school/service";
import { Card, Container, Badge } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import { StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";
import { ModuleHero } from "@/components/site/module-hero";
import { ModuleInfo } from "@/components/site/module-info";
import { CardArrow } from "@/components/site/card-arrow";
import { RatingBadge } from "@/components/site/rating-badge";
import { reviewService } from "@/server/modules/review/service";

export const metadata: Metadata = {
  title: "Paragliding Courses in Bir Billing — P1 to P4 Certification",
  description:
    "Learn to fly with a paragliding course at Bir Billing — P1 to P4 certification with experienced, BPA-certified instructors on real Himalayan terrain.",
  alternates: { canonical: "/courses" },
};

export default async function CoursesListPage() {
  const { items } = await courseService.listPublic({ page: 1, pageSize: 50 });
  const ratings = await reviewService.getRatingSummaries(
    "SCHOOL",
    items.map((course) => course.id),
  );

  return (
    <>
      <ModuleHero
        image="https://images.unsplash.com/photo-1506976697767-6c29c943ecbf?q=80&w=1920&h=1080&auto=format&fit=crop"
        imageAlt="A paraglider soaring over a forested mountain ridge at golden hour"
        eyebrow="Learn to fly"
        title="Paragliding Courses"
        subtitle="From your first solo flight to full certification — learn from experienced, BPA-certified instructors on real Bir Billing terrain."
        highlights={["P1 to P4 certification", "8-14 day courses", "Small batch sizes"]}
        effect="dust"
      />

      <Container className="py-16">
        <div className="flex justify-end">
          <Link href="/courses/instructors" className="text-sm font-medium text-brand hover:underline">
            Meet our instructors →
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="text-muted">No courses are available right now.</p>
        ) : (
          <StaggerGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((course) => (
              <StaggerItem key={course.id}>
                <Link href={`/courses/${course.slug}`} className="group">
                  <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative h-44 w-full">
                      <Image
                        src={course.media[0]?.url ?? "/placeholder.svg"}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                      <CardArrow />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <Badge tone="brand">{course.level}</Badge>
                        {ratings.get(course.id) && (
                          <RatingBadge average={ratings.get(course.id)!.average} count={ratings.get(course.id)!.count} />
                        )}
                      </div>
                      <h2 className="mt-3 text-lg font-semibold">{course.title}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{course.description}</p>
                      <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-lg font-bold">{formatINR(course.fee.toString())}</span>
                        <span className="text-xs text-muted">{course.durationDays} days</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </Container>

      <ModuleInfo
        heading="Learning to paraglide in Bir Billing"
        faqCategory="SCHOOL"
        paragraphs={[
          "A paragliding course takes you from zero to flying on your own. Beginner (P1–P2) courses start with ground handling — learning to inflate and steer the wing on the slope — then move to your first solo hops and short flights under radio guidance from the instructor.",
          "P3 builds height and thermalling so you can stay up and climb; P4 works toward cross-country flying and flying independently. Most people start with a 5–8 day P1–P2 course; going through P3 is around two weeks, weather depending.",
          "Training wing, harness, helmet and radio are included for the duration. Bir Billing's long season and gentle mornings make it one of the better places in India to learn. Each course page lists the exact syllabus, duration, batch dates and instructor.",
        ]}
      />
    </>
  );
}
