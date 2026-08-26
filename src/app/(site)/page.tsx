import Image from "next/image";
import Link from "next/link";
import { packageService } from "@/server/modules/paragliding/service";
import { courseService } from "@/server/modules/school/service";
import { hotelService } from "@/server/modules/hotel/service";
import { LinkButton } from "@/components/ui/button";
import { Container, Card, Badge } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import { ParticleField } from "@/components/effects/particle-field";
import { SpotlightCursor } from "@/components/effects/spotlight-cursor";
import { TextReveal } from "@/components/effects/text-reveal";
import { MagneticButton } from "@/components/effects/magnetic-button";
import { AuroraBackground } from "@/components/effects/aurora-background";
import { NoiseOverlay } from "@/components/effects/noise-overlay";
import { GradientText } from "@/components/effects/gradient-text";
import { ScrollReveal, StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";
import { TiltCard } from "@/components/effects/tilt-card";
import { GradientOrb } from "@/components/effects/gradient-orb";
import { HeroSceneLazy } from "@/components/effects/hero-scene-lazy";

const STATS = [
  { value: "10,000+", label: "Flights flown" },
  { value: "500+", label: "Pilots certified" },
  { value: "4.8/5", label: "Average rating" },
];

const WHY_US = [
  {
    title: "One booking, everything",
    description: "Flights, courses, and hotel rooms in a single checkout — one payment, one confirmation.",
  },
  {
    title: "Certified pilots & instructors",
    description: "Every tandem flight and course is run by BPA-certified pilots with years of Bir Billing airtime.",
  },
  {
    title: "Real-time availability",
    description: "Slots, batches, and rooms are locked the moment you pay — no double-bookings, no surprises.",
  },
  {
    title: "Secure payments",
    description: "Razorpay-backed checkout. Your money is only captured after your booking is confirmed.",
  },
  {
    title: "Flexible cancellation",
    description: "Plans change — cancel or reschedule from your account, no phone calls needed.",
  },
  {
    title: "Stay where you fly",
    description: "Book a room minutes from the takeoff site, in the same checkout as your flight.",
  },
];

export default async function HomePage() {
  const [flights, courses, hotels] = await Promise.all([
    packageService.listPublic({ page: 1, pageSize: 3 }),
    courseService.listPublic({ page: 1, pageSize: 3 }),
    hotelService.listPublic({ page: 1, pageSize: 1 }),
  ]);

  const hotel = hotels.items[0];

  return (
    <>
      <section className="relative flex min-h-[90vh] items-center overflow-hidden">
        <Image
          src="https://picsum.photos/seed/glideinbir-hero/1920/1080"
          alt="Misty mountain ridge over Bir Billing"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        <ParticleField variant="dust" density={50} />
        <SpotlightCursor color="255,255,255" />

        <Container className="relative z-10 py-24 text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
            Bir Billing, Himachal Pradesh
          </p>
          <TextReveal
            as="h1"
            text="Fly, learn, and stay — all in one place"
            className="mt-4 max-w-3xl text-5xl font-bold tracking-tight md:text-7xl"
          />
          <p className="mt-6 max-w-2xl text-xl text-white/85">
            Book tandem paragliding flights, certification courses, and hotel stays at
            India&apos;s home of paragliding.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton>
              <LinkButton href="/paragliding" size="lg">
                Book a flight
              </LinkButton>
            </MagneticButton>
            <MagneticButton>
              <LinkButton
                href="/school"
                variant="ghost"
                size="lg"
                className="border-white/40 text-white hover:bg-white/10"
              >
                Explore courses
              </LinkButton>
            </MagneticButton>
          </div>

          <div className="mt-20 grid max-w-lg grid-cols-3 gap-8 border-t border-white/20 pt-10">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold md:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {flights.items.length > 0 && (
        <Container className="py-24">
          <ScrollReveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-brand">
                  Tandem paragliding
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                  Popular flights
                </h2>
              </div>
              <Link href="/paragliding" className="text-sm font-medium text-brand hover:underline">
                View all flights →
              </Link>
            </div>
          </ScrollReveal>

          <StaggerGroup className="mt-10 grid gap-8 md:grid-cols-3">
            {flights.items.map((pkg) => (
              <StaggerItem key={pkg.id}>
                <TiltCard maxTilt={6} className="h-full">
                  <Link href={`/paragliding/${pkg.slug}`}>
                    <Card className="card-glow-hover h-full overflow-hidden">
                      <div className="relative h-64 w-full">
                        <Image
                          src={pkg.media[0]?.url ?? `https://picsum.photos/seed/${pkg.slug}/900/700`}
                          alt=""
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                          <Badge className="bg-white/20 text-white backdrop-blur">
                            {pkg.flightType.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold">{pkg.title}</h3>
                        <p className="mt-2 text-sm text-muted">
                          {pkg.shortDescription ?? pkg.description}
                        </p>
                        <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
                          <span className="text-2xl font-bold">
                            <GradientText>{formatINR(pkg.price.toString())}</GradientText>
                          </span>
                          <span className="text-sm text-muted">{pkg.durationMinutes} min</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      )}

      <section className="relative overflow-hidden bg-ink py-28 text-white">
        <AuroraBackground />
        <NoiseOverlay opacity={0.05} />
        <Container className="relative z-10 grid items-center gap-16 md:grid-cols-2">
          <ScrollReveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
              One platform
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Flights, courses, and stays — <GradientText>booked together</GradientText>
            </h2>
            <p className="mt-5 max-w-md text-lg text-white/70">
              No juggling three separate bookings. Pick your flight, your course, and your
              room, then check out once — one confirmation, one payment.
            </p>
          </ScrollReveal>
          <div className="relative h-80 md:h-[28rem]">
            <HeroSceneLazy />
          </div>
        </Container>
      </section>

      {courses.items.length > 0 && (
        <div className="dot-grid-bg border-y border-border bg-surface py-24">
          <Container>
            <ScrollReveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-brand">
                    Paragliding school
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                    Learn to fly
                  </h2>
                </div>
                <Link href="/school" className="text-sm font-medium text-brand hover:underline">
                  View all courses →
                </Link>
              </div>
            </ScrollReveal>

            <StaggerGroup className="mt-10 grid gap-8 md:grid-cols-3">
              {courses.items.map((course) => (
                <StaggerItem key={course.id}>
                  <Link href={`/school/${course.slug}`}>
                    <Card className="card-glow-hover h-full overflow-hidden bg-paper">
                      <div className="relative h-56 w-full">
                        <Image
                          src={course.media[0]?.url ?? `https://picsum.photos/seed/${course.slug}/900/700`}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <Badge>{course.level}</Badge>
                        <h3 className="mt-3 text-lg font-semibold">{course.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm text-muted">{course.description}</p>
                        <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
                          <span className="text-xl font-bold">{formatINR(course.fee.toString())}</span>
                          <span className="text-sm text-muted">{course.durationDays} days</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </Container>
        </div>
      )}

      {hotel && (
        <Container className="py-24">
          <ScrollReveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">
              Where to stay
            </p>
            <div className="mt-8 grid items-center gap-10 overflow-hidden rounded-3xl border border-border md:grid-cols-2">
              <div className="relative h-72 md:h-full md:min-h-[24rem]">
                <Image
                  src={hotel.media[0]?.url ?? `https://picsum.photos/seed/${hotel.slug}/1000/800`}
                  alt={hotel.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-8 md:p-10">
                <h2 className="text-3xl font-bold tracking-tight">{hotel.name}</h2>
                <p className="mt-1 text-sm text-muted">{hotel.city}</p>
                <p className="mt-4 text-muted">{hotel.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {hotel.amenities.slice(0, 4).map(({ amenity }) => (
                    <Badge key={amenity.id}>{amenity.name}</Badge>
                  ))}
                </div>
                <MagneticButton className="mt-8 inline-block">
                  <LinkButton href={`/hotels/${hotel.slug}`}>View rooms & rates</LinkButton>
                </MagneticButton>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      )}

      <section className="relative overflow-hidden py-24">
        <GradientOrb className="-top-10 -right-10" color="var(--color-brand)" size={340} />
        <GradientOrb className="bottom-0 -left-20" color="#6366f1" size={300} />
        <Container className="relative z-10">
          <ScrollReveal>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Why Glideinbir</h2>
          </ScrollReveal>
          <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((item) => (
              <StaggerItem key={item.title}>
                <Card className="card-glow-hover h-full p-6">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted">{item.description}</p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>
    </>
  );
}
