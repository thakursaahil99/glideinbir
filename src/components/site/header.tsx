"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Phone } from "lucide-react";
import { Container } from "@/components/ui/card";
import { LogoutButton } from "./logout-button";

const NAV_LINKS = [
  { href: "/paragliding", label: "Paragliding" },
  { href: "/school", label: "School" },
  { href: "/hotels", label: "Hotels" },
  { href: "/adventure", label: "Adventure" },
  { href: "/travel", label: "Travel" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ user }: { user: { name: string } | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Glide<span className="text-brand">in</span>bir
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "relative px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-brand" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="tel:+919805338877"
            className="hidden items-center gap-1.5 text-sm font-medium text-muted hover:text-brand lg:flex"
          >
            <Phone className="h-3.5 w-3.5" />
            +91 98053 38877
          </a>
          {user ? (
            <>
              <Link href="/account/bookings" className="text-sm font-medium hover:text-brand">
                {user.name}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-muted hover:text-ink">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
