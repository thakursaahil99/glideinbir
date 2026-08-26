import Link from "next/link";
import { Container } from "@/components/ui/card";
import { LogoutButton } from "./logout-button";

const NAV_LINKS = [
  { href: "/paragliding", label: "Paragliding" },
  { href: "/school", label: "School" },
  { href: "/hotels", label: "Hotels" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ user }: { user: { name: string } | null }) {
  return (
    <header className="border-b border-border bg-paper/95 backdrop-blur sticky top-0 z-40">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Glide<span className="text-brand">in</span>bir
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
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
                className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
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
