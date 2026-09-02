import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/card";
import { ParticleField } from "@/components/effects/particle-field";
import { ShootingStars } from "@/components/effects/shooting-stars";
import { GradientOrb } from "@/components/effects/gradient-orb";
import { TextReveal } from "@/components/effects/text-reveal";
import { HeroSceneLazy } from "@/components/effects/hero-scene-lazy";
import type { ShapeVariant } from "@/components/effects/hero-scene";

type Effect = "stars" | "dust" | "sparkles" | "orbs" | "none";

// Shared big, image-backed hero banner for every module's list page (home
// page keeps its own bespoke hero). Each module picks a different `effect`
// so the site doesn't look identical page to page — same idea as the
// distinct per-page effect combinations already used elsewhere on the site.
export function ModuleHero({
  image,
  imageAlt,
  eyebrow,
  title,
  subtitle,
  highlights,
  effect = "dust",
  shape,
  extra,
}: {
  image: string;
  imageAlt: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
  highlights?: string[];
  effect?: Effect;
  /** Optional floating 3D accent shape + tint, rendered bottom-right on desktop only. */
  shape?: { variant: ShapeVariant; color?: string; emissive?: string };
  /** Optional extra content (e.g. a live-conditions widget) below the highlight chips. */
  extra?: ReactNode;
}) {
  return (
    <section className="relative flex min-h-[60vh] items-center overflow-hidden md:min-h-[68vh]">
      <Image src={image} alt={imageAlt} fill priority className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />

      {effect === "stars" && (
        <>
          <ParticleField variant="stars" density={70} />
          <ShootingStars />
        </>
      )}
      {effect === "dust" && <ParticleField variant="dust" density={40} />}
      {effect === "sparkles" && <ParticleField variant="sparkles" density={30} />}
      {effect === "orbs" && (
        <>
          <GradientOrb className="-top-16 -right-16" color="#22d3ee" size={340} />
          <GradientOrb className="bottom-0 -left-20" color="var(--color-brand)" size={300} />
        </>
      )}

      {shape && (
        <div className="pointer-events-none absolute -right-8 bottom-0 z-[1] hidden h-72 w-72 opacity-90 lg:block xl:h-96 xl:w-96">
          <HeroSceneLazy variant={shape.variant} color={shape.color} emissive={shape.emissive} />
        </div>
      )}

      <Container className="relative z-10 py-20 text-white">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">{eyebrow}</p>
        )}
        <TextReveal
          as="h1"
          text={title}
          className="mt-3 text-4xl font-bold tracking-tight md:text-5xl"
        />
        <p className="mt-4 max-w-2xl text-lg text-white/80">{subtitle}</p>
        {highlights && highlights.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {highlights.map((h) => (
              <span key={h} className="glass rounded-full px-4 py-2 text-sm text-white">
                {h}
              </span>
            ))}
          </div>
        )}
        {extra && <div className="mt-6">{extra}</div>}
      </Container>
    </section>
  );
}
