"use client";

import { useState, useTransition } from "react";
import { User, Mail, Phone, MessageSquare } from "lucide-react";
import { AuthInput } from "./auth-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const EMPTY_FORM = { name: "", email: "", phone: "", message: "" };

export function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { error: showError } = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        const message = body.error?.message ?? "Could not send your message. Please try again.";
        setError(message);
        showError(message);
        return;
      }
      setSent(true);
      setForm(EMPTY_FORM);
    });
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-paper p-8 text-center">
        <h3 className="text-lg font-semibold">Thanks — message received!</h3>
        <p className="mt-2 text-sm text-muted">
          We&apos;ll get back to you shortly. For anything urgent, call us directly at{" "}
          <a href="tel:+919805338877" className="font-medium text-brand hover:underline">
            +91 98053 38877
          </a>
          .
        </p>
        <Button className="mt-6" variant="ghost" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthInput
        label="Name"
        icon={User}
        type="text"
        required
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        placeholder="Your name"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthInput
          label="Email"
          icon={Mail}
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="you@example.com"
        />
        <AuthInput
          label="Phone (optional)"
          icon={Phone}
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="Your number"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Message</label>
        <div className="relative mt-1">
          <MessageSquare className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted" />
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="How can we help?"
            className="w-full rounded-lg border border-border py-2 pl-10 pr-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
