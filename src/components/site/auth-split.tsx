import Image from "next/image";
import type { ReactNode } from "react";
import { ParticleField } from "@/components/effects/particle-field";

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
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1566291733164-2e369d0725fd?w=1200&q=75&auto=format&fit=crop"
          alt="Paraglider over the mountains"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40" />
        <ParticleField variant="dust" density={35} />
        <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
            Bir Billing, Himachal Pradesh
          </p>
          <h2 className="mt-3 max-w-sm text-3xl font-bold tracking-tight">
            Fly, learn, and stay — all in one place
          </h2>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            One account for every tandem flight, course, and hotel stay you book with us.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
