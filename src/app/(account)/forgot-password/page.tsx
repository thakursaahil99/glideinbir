"use client";

import { useState, useTransition } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthSplit } from "@/components/site/auth-split";
import { AuthInput } from "@/components/site/auth-input";
import { useToast } from "@/components/ui/toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Rate-limited (429) is the only real failure case here — the
      // endpoint always returns success otherwise, on purpose, so it can't
      // be used to check which emails are registered.
      if (res.status === 429) {
        const body = await res.json().catch(() => null);
        toast.error(body?.error?.message ?? "Too many attempts — please try again shortly.");
        return;
      }
      setDone(true);
    });
  }

  return (
    <AuthSplit title="Reset your password" subtitle="We'll email you a link to choose a new one.">
      {done ? (
        <p className="rounded-lg bg-surface px-4 py-3 text-sm text-muted">
          If that email is registered, we&apos;ve sent a reset link to it.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Email"
            icon={Mail}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthSplit>
  );
}
