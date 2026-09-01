import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { courseService } from "@/server/modules/school/service";
import { Card, Container, Badge } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import { StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";
import { ModuleHero } from "@/components/site/module-hero";
import { CardArrow } from "@/components/site/card-arrow";
import { RatingBadge } from "@/components/site/rating-badge";
import { reviewService } from "@/server/modules/review/service";

export const metadata: Metadata = {
  title: "Paragliding School in Bir Billing — P1 to P4 Certification",
  description:
    "Learn to fly at Bir Billing's paragliding school — P1 to P4 certification courses with experienced, BPA-certified instructors on real Himalayan terrain.",
  alternates: { canonical: "/school" },
};

export default async function SchoolListPage() {
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
        title="Paragliding School"
        subtitle="From your first solo flight to full certification — learn from experienced, BPA-certified instructors on real Bir Billing terrain."
        highlights={["P1 to P4 certification", "8-14 day courses", "Small batch sizes"]}
        effect="dust"
      />

      <Container className="py-16">
        {items.length === 0 ? (
          <p className="text-muted">No courses are available right now.</p>
        ) : (
          <StaggerGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((course) => (
              <StaggerItem key={course.id}>
                <Link href={`/school/${course.slug}`} className="group">
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
                        <Badge>{course.level}</Badge>
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
    </>
  );
}
