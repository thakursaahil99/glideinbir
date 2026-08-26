"use client";

import dynamic from "next/dynamic";

// next/dynamic with ssr:false must live in a Client Component (Next.js
// forbids it directly in a Server Component) — this wrapper is what pages
// import, keeping the ~150kb three.js/R3F bundle out of every route that
// doesn't render the hero.
const HeroScene = dynamic(() => import("./hero-scene").then((mod) => mod.HeroScene), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-3xl bg-white/5" />,
});

export function HeroSceneLazy() {
  return <HeroScene />;
}
