"use client";

import dynamic from "next/dynamic";
import type { ShapeVariant } from "./hero-scene";

// next/dynamic with ssr:false must live in a Client Component (Next.js
// forbids it directly in a Server Component) — this wrapper is what pages
// import, keeping the ~150kb three.js/R3F bundle out of every route that
// doesn't render a 3D scene. The chunk itself is shared/cached across every
// page that does, so using it in several places (module heroes, booking)
// doesn't re-download it each time.
const HeroScene = dynamic(() => import("./hero-scene").then((mod) => mod.HeroScene), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-3xl bg-white/5" />,
});

export function HeroSceneLazy(props: { variant?: ShapeVariant; color?: string; emissive?: string }) {
  return <HeroScene {...props} />;
}
