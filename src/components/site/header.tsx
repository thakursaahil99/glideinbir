"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Phone, Menu, X, Search } from "lucide-react";
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
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  // Close the mobile menu on route change — adjusted during render (React's
  // recommended pattern for "reset state when a prop changes") rather than
  // an effect, which would cause an extra render pass.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={searchOpen ? "Close search" : "Search"}
              aria-expanded={searchOpen}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-black/5"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
            {searchOpen && (
              <form
                onSubmit={submitSearch}
                className="absolute right-0 top-11 w-72 rounded-xl border border-border bg-paper p-2 shadow-lg"
              >
                <input
                  autoFocus
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search flights, hotels, treks…"
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </form>
            )}
          </div>

          <a
            href="tel:+919805338877"
            className="hidden items-center gap-1.5 px-2 text-sm font-medium text-muted hover:text-brand lg:flex"
          >
            <Phone className="h-3.5 w-3.5" />
            +91 98053 38877
          </a>

          <div className="hidden items-center gap-4 pl-2 md:flex">
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

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile menu panel — everything the desktop nav + account area has,
          stacked, since the top bar hides all of it below `md`. */}
      {mobileOpen && (
        <div className="border-t border-border bg-paper md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            <form onSubmit={submitSearch} className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flights, hotels, treks…"
                className="w-full rounded-lg border border-border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand"
              />
            </form>

            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "rounded-lg px-3 py-2.5 text-base font-medium",
                    active ? "bg-brand/10 text-brand" : "text-ink hover:bg-black/5",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            <a
              href="tel:+919805338877"
              className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-muted"
            >
              <Phone className="h-4 w-4" />
              +91 98053 38877
            </a>

            <div className="mt-2 border-t border-border pt-4">
              {user ? (
                <div className="flex items-center justify-between px-3">
                  <Link href="/account/bookings" className="text-base font-medium">
                    {user.name}
                  </Link>
                  <LogoutButton />
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-3">
                  <Link href="/login" className="text-base font-medium text-muted">
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="mt-1 rounded-full bg-brand px-4 py-2.5 text-center text-base font-medium text-white"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
