import type { ReactNode } from "react";
import { HeroSceneLazy } from "@/components/effects/hero-scene-lazy";
import { Card } from "@/components/ui/card";

export function AuthSplit({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="dot-grid-bg flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      <div className="relative w-full max-w-md">
        <div className="pointer-events-none absolute -right-10 -top-14 hidden h-36 w-36 opacity-90 sm:block">
          <HeroSceneLazy variant="icosahedron" />
        </div>
        <Card className="relative z-10 p-8 shadow-lg">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </Card>
      </div>
    </div>
  );
}
