"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Phone, Menu, X, Search, Palette } from "lucide-react";
import { Container } from "@/components/ui/card";
import { LogoutButton } from "./logout-button";
import { BrandColorPicker } from "@/components/effects/brand-color-picker";
import { MODULE_THEME, type ModuleKey } from "@/lib/module-theme";

const NAV_LINKS: { href: string; label: string; theme?: ModuleKey }[] = [
  { href: "/paragliding", label: "Paragliding", theme: "paragliding" },
  { href: "/courses", label: "Courses", theme: "school" },
  { href: "/hotels", label: "Hotels", theme: "hotels" },
  { href: "/adventure", label: "Adventure", theme: "adventure" },
  { href: "/travel", label: "Travel", theme: "travel" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export function SiteHeader({ user }: { user: { name: string } | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  // Scroll-aware chrome: the bar firms up (more blur, shadow, shorter) once
  // the page moves, and tucks away while scrolling down, back on scroll up.
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [tucked, setTucked] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 12);
    setTucked(y > 240 && y > prev + 2);
    if (y < prev - 2) setTucked(false);
  });
  const hidden = tucked && !mobileOpen && !searchOpen && !paletteOpen;

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
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.35, ease: EASE }}
      className={clsx(
        "sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "border-border/70 bg-paper/75 shadow-[0_8px_30px_-12px_rgba(16,20,24,0.18)] backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-paper/90 backdrop-blur-md",
      )}
    >
      <Container
        className={clsx(
          "flex items-center justify-between transition-[height] duration-300",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <Link href="/" className="group relative text-xl font-bold tracking-tight">
          Glide
          <span className="relative inline-block text-brand transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-6deg]">
            in
          </span>
          bir
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" onMouseLeave={() => setHoveredHref(null)}>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const theme = MODULE_THEME[link.theme ?? "overview"];
            return (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHoveredHref(link.href)}
                className={clsx(
                  "relative isolate px-3 py-2 text-sm font-medium transition-colors",
                  active ? theme.text : "text-muted hover:text-ink",
                )}
              >
                {hoveredHref === link.href && (
                  <motion.span
                    layoutId="nav-hover"
                    className="absolute inset-0 -z-10 rounded-full bg-black/[0.05]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className={clsx("absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full", theme.solid)}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => {
                setSearchOpen((v) => !v);
                setPaletteOpen(false);
              }}
              aria-label={searchOpen ? "Close search" : "Search"}
              aria-expanded={searchOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-black/5"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  onSubmit={submitSearch}
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="absolute right-0 top-11 w-72 origin-top-right rounded-2xl border border-border bg-paper/95 p-2 shadow-xl backdrop-blur-xl"
                >
                  <input
                    autoFocus
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search flights, hotels, treks…"
                    className="w-full rounded-xl border border-border px-3 py-2 text-base outline-none transition-colors focus:border-brand sm:text-sm"
                  />
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => {
                setPaletteOpen((v) => !v);
                setSearchOpen(false);
              }}
              aria-label={paletteOpen ? "Close colour picker" : "Change site colour"}
              aria-expanded={paletteOpen}
              className="group flex h-9 w-9 items-center justify-center rounded-full text-brand transition-colors hover:bg-brand/10"
            >
              <Palette className="h-4.5 w-4.5 transition-transform duration-500 group-hover:rotate-[20deg]" />
            </button>
            <AnimatePresence>
              {paletteOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="absolute right-0 top-11 w-64 origin-top-right rounded-2xl border border-border bg-paper/95 p-4 shadow-xl backdrop-blur-xl"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted">Site colour</p>
                  <BrandColorPicker className="mt-3" />
                </motion.div>
              )}
            </AnimatePresence>
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
                  className="btn-shine rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-[background-color,box-shadow,transform] hover:bg-brand-dark active:scale-[0.97]"
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
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink md:hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? "x" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </Container>

      {/* Mobile menu panel — everything the desktop nav + account area has,
          stacked, since the top bar hides all of it below `md`. */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden border-t border-border bg-paper md:hidden"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } } }}
            >
              <Container className="flex flex-col gap-1 py-4">
                <MobileItem>
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
                </MobileItem>

                {NAV_LINKS.map((link) => {
                  const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  const theme = MODULE_THEME[link.theme ?? "overview"];
                  return (
                    <MobileItem key={link.href}>
                      <Link
                        href={link.href}
                        className={clsx(
                          "block rounded-lg px-3 py-2.5 text-base font-medium",
                          active ? clsx(theme.soft, theme.text) : "text-ink hover:bg-black/5",
                        )}
                      >
                        {link.label}
                      </Link>
                    </MobileItem>
                  );
                })}

                <MobileItem className="mt-2 px-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted">Site colour</p>
                  <BrandColorPicker className="mt-2" />
                </MobileItem>

                <MobileItem>
                  <a
                    href="tel:+919805338877"
                    className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-muted"
                  >
                    <Phone className="h-4 w-4" />
                    +91 98053 38877
                  </a>
                </MobileItem>

                <MobileItem className="mt-2 border-t border-border pt-4">
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
                </MobileItem>
              </Container>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function MobileItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, x: -12 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}
