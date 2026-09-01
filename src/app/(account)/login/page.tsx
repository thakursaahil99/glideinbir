"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthSplit } from "@/components/site/auth-split";
import { AuthInput } from "@/components/site/auth-input";
import { useToast } from "@/components/ui/toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        const message = body.error?.message ?? "Login failed.";
        setError(message);
        toast.error(message);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    });
  }

  return (
    <AuthSplit title="Welcome back" subtitle="Log in to manage your bookings.">
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
        <AuthInput
          label="Password"
          icon={Lock}
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? "Logging in…" : "Log in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/register" className="font-medium text-brand hover:underline">
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-center text-sm">
        <Link href="/forgot-password" className="text-muted hover:text-ink">
          Forgot password?
        </Link>
      </p>
    </AuthSplit>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
