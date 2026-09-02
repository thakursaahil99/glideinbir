import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { instructorService } from "@/server/modules/school/service";
import { Card, Container, Badge } from "@/components/ui/card";
import { StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";
import { ModuleHero } from "@/components/site/module-hero";
import { Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Instructors — Bir Billing Paragliding School",
  description:
    "Meet the BPA-certified instructors teaching paragliding at Bir Billing's paragliding school — experience, certifications, and who you'll actually fly and train with.",
  alternates: { canonical: "/school/instructors" },
};

export default async function InstructorsListPage() {
  const instructors = await instructorService.listPublic();

  return (
    <>
      <ModuleHero
        image="https://images.unsplash.com/photo-1722253991955-7359db2e7e5e?q=80&w=1920&h=1080&auto=format&fit=crop"
        imageAlt="A certified pilot briefing a student before a paragliding flight"
        eyebrow="Who you'll fly with"
        title="Our instructors"
        subtitle="Every course on Glideinbir is taught by a real, named instructor — not a faceless team."
        highlights={["BPA-certified", "Years of Bir Billing experience", "Small batch sizes"]}
        effect="dust"
      />

      <Container className="py-16">
        {instructors.length === 0 ? (
          <p className="text-muted">No instructor profiles are published yet.</p>
        ) : (
          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {instructors.map((instructor) => (
              <StaggerItem key={instructor.id}>
                <Link href={`/school/instructors/${instructor.slug}`} className="group">
                  <Card className="card-glow-hover h-full p-6 text-center">
                    <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full bg-surface">
                      <Image
                        src={instructor.photoUrl ?? "/placeholder.svg"}
                        alt={instructor.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h2 className="mt-4 font-semibold">{instructor.name}</h2>
                    {instructor.experienceYears != null && (
                      <p className="mt-1 text-sm text-muted">{instructor.experienceYears}+ years flying</p>
                    )}
                    {instructor.certifications.length > 0 && (
                      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                        {instructor.certifications.slice(0, 2).map((cert) => (
                          <Badge key={cert} className="gap-1">
                            <Award className="h-3 w-3" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    )}
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
