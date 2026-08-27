"use client";

import dynamic from "next/dynamic";

const RubiksCubeScene = dynamic(() => import("./rubiks-cube").then((mod) => mod.RubiksCubeScene), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-3xl bg-white/5" />,
});

export function RubiksCubeLazy() {
  return (
    <div className="h-full w-full touch-none cursor-grab active:cursor-grabbing">
      <RubiksCubeScene />
    </div>
  );
}
