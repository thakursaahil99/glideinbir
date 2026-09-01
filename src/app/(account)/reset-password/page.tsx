"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthSplit } from "@/components/site/auth-split";
import { AuthInput } from "@/components/site/auth-input";
import { useToast } from "@/components/ui/toast";

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        const message = body.error?.message ?? "Could not reset password.";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success("Password updated — log in with your new password.");
      router.push("/login");
    });
  }

  if (!token) {
    return (
      <AuthSplit title="Invalid link">
        <p className="text-sm text-muted">
          This reset link is missing its token. Please use the link from your email.
        </p>
      </AuthSplit>
    );
  }

  return (
    <AuthSplit title="Choose a new password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="New password"
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
          {isPending ? "Saving…" : "Save new password"}
        </Button>
      </form>
    </AuthSplit>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
