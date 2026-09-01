"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";

// Route-level error boundary — catches anything an app/(site or admin)
// page throws during render so a visitor gets a friendly page instead of
// Next's raw crash screen. Logged to the console (picked up by Vercel's
// function logs) since there's no error-tracking service wired up yet.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled page error", error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand">Something went wrong</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">This page hit a snag</h1>
      <p className="mt-3 max-w-md text-muted">
        Sorry about that — try again, or head back home. If it keeps happening, call us at{" "}
        <a href="tel:+919805338877" className="font-medium text-brand hover:underline">
          +91 98053 38877
        </a>
        .
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <LinkButton href="/" variant="ghost">
          Go home
        </LinkButton>
      </div>
    </Container>
  );
}
