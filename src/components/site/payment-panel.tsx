"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { markJustConfirmed } from "@/components/site/booking-celebration";

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

export function PaymentPanel({
  bookingId,
  customer,
  fullLabel,
  tokenLabel,
  balanceLabel,
}: {
  bookingId: string;
  /** Formatted full booking total, e.g. "₹3,500". */
  fullLabel: string;
  /** Formatted token minimum (e.g. "₹600"); omit when the booking is cheaper than the token. */
  tokenLabel?: string;
  /** Formatted balance left for Bir if the token option is picked. */
  balanceLabel?: string;
  customer: { name: string; email: string; phone: string };
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "verifying" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  // Full payment is the default; the ₹600 token is the minimum alternative.
  const [option, setOption] = useState<"full" | "token">("full");
  const isToken = option === "token" && !!tokenLabel;

  async function startPayment() {
    setStatus("loading");
    setError(null);
    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, option }),
      });
      const orderBody = await orderRes.json();
      if (!orderRes.ok || !orderBody.success) {
        throw new Error(orderBody.error?.message ?? "Could not start payment.");
      }

      // Demo mode (no real Razorpay account configured yet): skip the
      // checkout widget entirely and confirm the booking directly, so the
      // whole flow — availability locking, booking status, everything — is
      // exercisable without real payment credentials.
      if (orderBody.data.demoMode) {
        setStatus("verifying");
        const confirmRes = await fetch("/api/payments/demo-confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });
        const confirmBody = await confirmRes.json();
        if (!confirmRes.ok || !confirmBody.success || confirmBody.data?.confirmed === false) {
          setStatus("error");
          setError(confirmBody.data?.reason ?? confirmBody.error?.message ?? "Payment could not be confirmed.");
          return;
        }
        markJustConfirmed(bookingId);
        router.refresh();
        return;
      }

      const { orderId, amount, currency, keyId } = orderBody.data;
      const razorpay = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: "Glideinbir",
        description: isToken ? "Pre-booking token" : "Booking payment",
        prefill: { name: customer.name, email: customer.email, contact: customer.phone },
        handler: async (response) => {
          setStatus("verifying");
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verifyBody = await verifyRes.json();
          if (!verifyRes.ok || !verifyBody.success || verifyBody.data?.confirmed === false) {
            setStatus("error");
            setError(verifyBody.data?.reason ?? verifyBody.error?.message ?? "Payment could not be confirmed.");
            return;
          }
          markJustConfirmed(bookingId);
          router.refresh();
        },
        modal: { ondismiss: () => setStatus("idle") },
      });
      razorpay.open();
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="space-y-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      {tokenLabel && (
        <div role="radiogroup" aria-label="Payment option" className="space-y-2">
          <PayChoice
            selected={option === "full"}
            onSelect={() => setOption("full")}
            title="Pay in full"
            amount={fullLabel}
            note="Nothing left to pay in Bir"
            badge="Recommended"
          />
          <PayChoice
            selected={option === "token"}
            onSelect={() => setOption("token")}
            title="Pay token to book"
            amount={tokenLabel}
            note={balanceLabel ? `Balance ${balanceLabel} payable in Bir` : "Balance payable in Bir"}
          />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        className="w-full"
        disabled={status === "loading" || status === "verifying"}
        onClick={startPayment}
      >
        {status === "loading"
          ? "Starting payment…"
          : status === "verifying"
            ? "Confirming…"
            : isToken
              ? `Pay ${tokenLabel} to book`
              : `Pay ${fullLabel}`}
      </Button>
    </div>
  );
}

function PayChoice({
  selected,
  onSelect,
  title,
  amount,
  note,
  badge,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  amount: string;
  note: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
        selected ? "border-brand bg-brand/5 ring-1 ring-brand" : "border-border hover:border-brand/50"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? "border-brand" : "border-border"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-semibold">
          {title}
          {badge && (
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
              {badge}
            </span>
          )}
        </span>
        <span className="block text-xs text-muted">{note}</span>
      </span>
      <span className="text-sm font-bold">{amount}</span>
    </button>
  );
}
