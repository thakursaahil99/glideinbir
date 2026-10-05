import Image from "next/image";
import Link from "next/link";
import { packageService } from "@/server/modules/paragliding/service";
import { courseService } from "@/server/modules/school/service";
import { hotelService } from "@/server/modules/hotel/service";
import { itemService } from "@/server/modules/adventure/service";
import { routeService } from "@/server/modules/travel/service";
import { LinkButton } from "@/components/ui/button";
import { Container, Card, Badge } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import { SpotlightCursor } from "@/components/effects/spotlight-cursor";
import { TextReveal } from "@/components/effects/text-reveal";
import { MagneticButton } from "@/components/effects/magnetic-button";
import { AuroraBackground } from "@/components/effects/aurora-background";
import { NoiseOverlay } from "@/components/effects/noise-overlay";
import { GradientText } from "@/components/effects/gradient-text";
import { ScrollReveal, StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";
import { TiltCard } from "@/components/effects/tilt-card";
import { GradientOrb } from "@/components/effects/gradient-orb";
import { RubiksCubeLazy } from "@/components/effects/rubiks-cube-lazy";
import { BrandColorPicker } from "@/components/effects/brand-color-picker";
import { HeroParallax } from "@/components/effects/hero-parallax";
import { CountUp } from "@/components/effects/count-up";
import { Marquee } from "@/components/effects/marquee";
import { SpotlightCard } from "@/components/effects/spotlight-card";
import {
  Wind,
  GraduationCap,
  Hotel,
  Tent,
  Bus,
  ShieldCheck,
  Plane,
  Layers,
  BadgeCheck,
  CalendarClock,
  Lock,
  RefreshCw,
  MapPin,
  ArrowRight,
  Sparkle,
} from "lucide-react";
import { SectionHeader } from "@/components/site/section-header";
import { CardArrow } from "@/components/site/card-arrow";
import { HowItWorks, BirBillingTeaser, PlanningGuides } from "@/components/site/home-sections";
import { VideoSection } from "@/components/site/video-section";
import { HeroMedia } from "@/components/site/hero-media";
import { MomentsSection } from "@/components/site/moments-section";
import { stockPhoto } from "@/lib/stock-photos";

const MODULES = [
  { icon: Wind, label: "Paragliding" },
  { icon: GraduationCap, label: "Courses" },
  { icon: Hotel, label: "Hotels" },
  { icon: Tent, label: "Adventure" },
  { icon: Bus, label: "Travel" },
];

const STATS = [
  { value: "10,000+", label: "Flights flown" },
  { value: "500+", label: "Pilots certified" },
  { value: "4.8/5", label: "Average rating" },
];

const TICKER = [
  "Tandem flights",
  "P1 & P2 courses",
  "2,400 m takeoff",
  "BPA-certified pilots",
  "200+ flyable days",
  "Stays near the launch",
  "Camping & treks",
  "Volvo & taxi to Bir",
];

const WHY_US = [
  {
    title: "One booking, everything",
    description: "Flights, courses, and hotel rooms in a single checkout — one payment, one confirmation.",
    icon: Layers,
    color: "text-sky-600 bg-sky-500/10",
  },
  {
    title: "Certified pilots & instructors",
    description: "Every tandem flight and course is run by BPA-certified pilots with years of Bir Billing airtime.",
    icon: BadgeCheck,
    color: "text-violet-600 bg-violet-500/10",
  },
  {
    title: "Real-time availability",
    description: "Slots, batches, and rooms are locked the moment you pay — no double-bookings, no surprises.",
    icon: CalendarClock,
    color: "text-emerald-600 bg-emerald-500/10",
  },
  {
    title: "Secure payments",
    description: "Razorpay-backed checkout. Your money is only captured after your booking is confirmed.",
    icon: Lock,
    color: "text-rose-600 bg-rose-500/10",
  },
  {
    title: "Flexible cancellation",
    description: "Plans change — cancel or reschedule from your account, no phone calls needed.",
    icon: RefreshCw,
    color: "text-amber-600 bg-amber-500/10",
  },
  {
    title: "Stay where you fly",
    description: "Book a room minutes from the takeoff site, in the same checkout as your flight.",
    icon: MapPin,
    color: "text-teal-600 bg-teal-500/10",
  },
];

export default async function HomePage() {
  const [flights, courses, hotels, adventures, routes] = await Promise.all([
    packageService.listPublic({ page: 1, pageSize: 3 }),
    courseService.listPublic({ page: 1, pageSize: 3 }),
    hotelService.listPublic({ page: 1, pageSize: 1 }),
    itemService.listPublic({ page: 1, pageSize: 3 }),
    routeService.listPublic({ page: 1, pageSize: 3 }),
  ]);

  const hotel = hotels.items[0];

  return (
    <>
      <HeroParallax
        className="flex min-h-[92vh] items-center"
        media={<HeroMedia alt="Misty forested mountain ridge above Bir Billing" />}
        overlay={
          <>
            {/* Darken the left, where the headline sits, and the bottom for the
                stats row — keep the ridge on the right readable. */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />
            {/* Brand wash — the hero takes on whatever colour the site is tuned to. */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand/45 via-brand/10 to-transparent mix-blend-soft-light" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand/25 to-transparent" />
            <SpotlightCursor />

            <div className="absolute right-6 top-24 z-20 hidden flex-col gap-3 md:flex lg:right-16">
              <ScrollReveal direction="left" delay={0.6}>
                <div className="glass float-y flex items-center gap-3 rounded-2xl px-4 py-3 text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/20">
                    <ShieldCheck className="h-5 w-5 text-brand" />
                  </span>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold">BPA-certified pilots</p>
                    <p className="text-xs text-white/60">Every flight, every time</p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={0.8}>
                <div
                  className="glass float-y ml-10 flex items-center gap-3 rounded-2xl px-4 py-3 text-white"
                  style={{ animationDelay: "-2.5s" }}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/20">
                    <Plane className="h-5 w-5 text-brand" />
                  </span>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold">10,000+ flights flown</p>
                    <p className="text-xs text-white/60">Since day one</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <a
              href="#explore"
              aria-label="Scroll to explore"
              className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/70 transition-colors hover:text-white md:flex"
            >
              <span className="flex h-10 w-6 justify-center rounded-full border-2 border-current pt-2">
                <span className="scroll-dot h-2 w-1 rounded-full bg-current" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em]">Scroll</span>
            </a>
          </>
        }
      >
        <Container className="py-24 text-white">
          <ScrollReveal>
            <p className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/90">
              <span className="relative flex h-2 w-2">
                <span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Bir Billing, Himachal Pradesh · Now booking
            </p>
          </ScrollReveal>
          <TextReveal
            as="h1"
            text="Fly, learn, and stay — all in one place"
            highlightFrom={5}
            delay={0.15}
            className="mt-6 max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
          />
          <ScrollReveal delay={0.45}>
            <p className="mt-6 max-w-2xl text-xl text-white/85">
              Book tandem paragliding flights, certification courses, and hotel stays at
              India&apos;s home of paragliding.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.6}>
          <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <MagneticButton className="w-full sm:w-auto">
              <LinkButton href="/paragliding" size="lg" className="w-full sm:w-auto">
                Book a flight
                <ArrowRight className="h-4 w-4" />
              </LinkButton>
            </MagneticButton>
            <MagneticButton className="w-full sm:w-auto">
              <LinkButton
                href="/courses"
                variant="ghost"
                size="lg"
                className="w-full border-white/40 text-white backdrop-blur-sm hover:bg-white/10 sm:w-auto"
              >
                Explore courses
              </LinkButton>
            </MagneticButton>
          </div>
          </ScrollReveal>

          <ScrollReveal delay={0.75}>
            <div className="mt-20 grid max-w-lg grid-cols-3 gap-8 border-t border-white/20 pt-10">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold tabular-nums md:text-4xl">
                    <CountUp value={stat.value} />
                  </div>
                  <div className="mt-1 text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </Container>
      </HeroParallax>

      <div id="explore" className="relative z-10 -mt-px scroll-mt-14 border-y border-white/10 bg-night py-5 text-white">
        <Marquee
          items={TICKER.map((t) => (
            <>
              <span className="px-6 text-lg font-semibold tracking-tight md:text-2xl">{t}</span>
              <Sparkle className="h-4 w-4 text-brand" fill="currentColor" />
            </>
          ))}
        />
      </div>

      {flights.items.length > 0 && (
        <div className="band-ocean py-24">
          <Container>
            <ScrollReveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeader eyebrow="Tandem paragliding" icon={Wind} title="Popular flights" tone="paragliding" />
                <Link href="/paragliding" className="text-sm font-medium text-brand hover:underline">
                  View all flights →
                </Link>
              </div>
            </ScrollReveal>

            <StaggerGroup className="mt-10 grid gap-8 md:grid-cols-3">
              {flights.items.map((pkg) => (
                <StaggerItem key={pkg.id}>
                  <TiltCard maxTilt={6} className="h-full">
                    <Link href={`/paragliding/${pkg.slug}`} className="group">
                      <Card className="card-glow-hover h-full overflow-hidden border-t-4 border-t-sky-500 bg-paper">
                        <div className="relative h-64 w-full">
                          <Image
                            src={pkg.media[0]?.url ?? stockPhoto("paragliding", pkg.title)}
                            alt={pkg.title}
                            fill
                            className="object-cover"
                          />
                          <CardArrow />
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
        </div>
      )}

      <HowItWorks />

      <MomentsSection />

      <VideoSection videoId={process.env.NEXT_PUBLIC_FLIGHT_VIDEO_ID} />

      {courses.items.length > 0 && (
        <div className="band-aurora border-y border-border py-24">
          <Container>
            <ScrollReveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeader eyebrow="Learn to fly" icon={GraduationCap} title="Paragliding courses" tone="school" />
                <Link href="/courses" className="text-sm font-medium text-brand hover:underline">
                  View all courses →
                </Link>
              </div>
            </ScrollReveal>

            <StaggerGroup className="mt-10 grid gap-8 md:grid-cols-3">
              {courses.items.map((course) => (
                <StaggerItem key={course.id}>
                  <Link href={`/courses/${course.slug}`} className="group">
                    <Card className="card-glow-hover h-full overflow-hidden border-t-4 border-t-violet-500 bg-paper">
                      <div className="relative h-56 w-full">
                        <Image
                          src={course.media[0]?.url ?? stockPhoto("course", course.title)}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                        <CardArrow />
                      </div>
                      <div className="p-6">
                        <Badge tone="brand">{course.level}</Badge>
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
            <SectionHeader eyebrow="Where to stay" icon={Hotel} title="Rest easy near the launch" tone="hotels" />
            <div className="mt-8 grid items-center gap-10 overflow-hidden rounded-3xl border border-border md:grid-cols-2">
              <div className="relative h-72 md:h-full md:min-h-[24rem]">
                <Image
                  src={hotel.media[0]?.url ?? stockPhoto("hotel", hotel.name)}
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

      {adventures.items.length > 0 && (
        <div className="band-meadow border-y border-border py-24">
          <Container>
            <ScrollReveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeader eyebrow="Beyond the flight" icon={Tent} title="Adventure" tone="adventure" />
                <Link href="/adventure" className="text-sm font-medium text-brand hover:underline">
                  View all adventures →
                </Link>
              </div>
            </ScrollReveal>

            <StaggerGroup className="mt-10 grid gap-8 md:grid-cols-3">
              {adventures.items.map((item) => (
                <StaggerItem key={item.id}>
                  <Link href={`/adventure/${item.slug}`} className="group">
                    <Card className="card-glow-hover h-full overflow-hidden border-t-4 border-t-rose-500">
                      <div className="relative h-56 w-full">
                        <Image
                          src={item.media[0]?.url ?? stockPhoto("adventure", item.title)}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        <CardArrow />
                      </div>
                      <div className="p-6">
                        <Badge tone="brand">{item.category.name}</Badge>
                        <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm text-muted">
                          {item.shortDescription ?? item.description}
                        </p>
                        <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
                          <span className="text-xl font-bold">{formatINR(item.price.toString())}</span>
                          <span className="text-sm text-muted">{item.durationLabel}</span>
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

      {routes.items.length > 0 && (
        <div className="band-ocean border-y border-border py-24">
          <Container>
            <ScrollReveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeader eyebrow="Getting there" icon={Bus} title="Travel" tone="travel" />
                <Link href="/travel" className="text-sm font-medium text-brand hover:underline">
                  View all routes →
                </Link>
              </div>
            </ScrollReveal>

            <StaggerGroup className="mt-10 grid gap-8 md:grid-cols-3">
              {routes.items.map((route) => (
                <StaggerItem key={route.id}>
                  <Link href={`/travel/${route.slug}`} className="group">
                    <Card className="card-glow-hover h-full overflow-hidden border-t-4 border-t-teal-500 bg-paper">
                      <div className="relative h-56 w-full">
                        <Image
                          src={route.media[0]?.url ?? stockPhoto("travel", route.title)}
                          alt={route.title}
                          fill
                          className="object-cover"
                        />
                        <CardArrow />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                          <Badge className="bg-white/20 text-white backdrop-blur">{route.mode}</Badge>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold">{route.title}</h3>
                        <p className="mt-1 text-sm text-muted">
                          {route.fromLocation} → {route.toLocation}
                        </p>
                        <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
                          <span className="text-xl font-bold">{formatINR(route.price.toString())}</span>
                          <span className="text-sm text-muted">{route.durationLabel}</span>
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

      <BirBillingTeaser />

      <PlanningGuides />

      <div className="band-sunset border-y border-border py-24">
        <Container className="grid items-center gap-12 md:grid-cols-2">
          <ScrollReveal>
            <SectionHeader
              eyebrow="One platform"
              icon={Layers}
              title="Flights, stays & adventures — one checkout"
              description="No juggling five separate operators. Pick your flight, course, room, adventure and ride, then check out once — one confirmation, one payment."
            />
            <div className="mt-8 flex flex-wrap gap-2.5">
              {MODULES.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-paper px-4 py-2 text-sm font-medium"
                >
                  <Icon className="h-4 w-4 text-brand" strokeWidth={2} />
                  {label}
                </span>
              ))}
            </div>
            <p className="mt-8 max-w-md text-sm text-muted">
              <span className="font-semibold text-ink">Make it yours:</span> grab a colour off
              the cube and the whole site retunes to it — saved to your browser, so it stays
              picked wherever you go.
            </p>
            <MagneticButton className="mt-6 inline-block">
              <LinkButton href="/paragliding" size="lg">
                Explore everything
              </LinkButton>
            </MagneticButton>
          </ScrollReveal>

          <div>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-night">
              <AuroraBackground className="opacity-50" />
              <NoiseOverlay opacity={0.04} />
              <div className="relative z-10 h-[24rem] md:h-[30rem]">
                <RubiksCubeLazy />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted">
                Drag the cube to spin it. Pick a colour and the whole site retunes:
              </p>
              <BrandColorPicker className="mt-2.5" />
            </div>
          </div>
        </Container>
      </div>

      <section className="relative overflow-hidden py-24">
        <GradientOrb className="-top-10 -right-10" color="var(--color-brand)" size={340} />
        <GradientOrb className="bottom-0 -left-20" color="var(--color-brand-dark)" size={300} />
        <Container className="relative z-10">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Why book with us"
              icon={ShieldCheck}
              title="Why Glideinbir"
              align="center"
            />
          </ScrollReveal>
          <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((item) => (
              <StaggerItem key={item.title}>
                <SpotlightCard className="group h-full p-6 transition-transform duration-300 hover:-translate-y-1">
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 ${item.color}`}
                  >
                    <item.icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted">{item.description}</p>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>
    </>
  );
}
