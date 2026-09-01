"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthSplit } from "@/components/site/auth-split";
import { AuthInput } from "@/components/site/auth-input";
import { useToast } from "@/components/ui/toast";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: phone || undefined, password }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        const message = body.error?.message ?? "Registration failed.";
        setError(message);
        toast.error(message);
        return;
      }
      router.push("/");
      router.refresh();
    });
  }

  return (
    <AuthSplit title="Create your account" subtitle="Book flights, courses, and stays in one place.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Full name"
          icon={User}
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          label="Phone (optional)"
          icon={Phone}
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <AuthInput
          label="Password"
          icon={Lock}
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Log in
        </Link>
      </p>
    </AuthSplit>
  );
}
