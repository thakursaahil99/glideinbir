import { Container } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">This page took off without you</h1>
      <p className="mt-3 max-w-md text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Try one of these instead.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href="/">Home</LinkButton>
        <LinkButton href="/paragliding" variant="ghost">
          Paragliding
        </LinkButton>
        <LinkButton href="/contact" variant="ghost">
          Contact us
        </LinkButton>
      </div>
    </Container>
  );
}
