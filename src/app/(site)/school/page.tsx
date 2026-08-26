import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { courseService } from "@/server/modules/school/service";
import { Card, Container, Badge } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import { TextReveal } from "@/components/effects/text-reveal";
import { StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";

export const metadata: Metadata = { title: "Paragliding School" };

export default async function SchoolListPage() {
  const { items } = await courseService.listPublic({ page: 1, pageSize: 50 });

  return (
    <>
      <div className="dot-grid-bg border-b border-border bg-surface py-20">
        <Container>
          <TextReveal
            as="h1"
            text="Paragliding School"
            className="text-3xl font-bold tracking-tight md:text-4xl"
          />
          <p className="mt-3 max-w-xl text-muted">
            From your first solo flight to full certification — learn from experienced
            instructors.
          </p>
        </Container>
      </div>

      <Container className="py-16">
        {items.length === 0 ? (
          <p className="text-muted">No courses are available right now.</p>
        ) : (
          <StaggerGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((course) => (
              <StaggerItem key={course.id}>
                <Link href={`/school/${course.slug}`}>
                  <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative h-44 w-full">
                      <Image
                        src={course.media[0]?.url ?? `https://picsum.photos/seed/${course.slug}/800/600`}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <Badge>{course.level}</Badge>
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
