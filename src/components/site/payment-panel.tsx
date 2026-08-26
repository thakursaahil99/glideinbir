"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
}: {
  bookingId: string;
  customer: { name: string; email: string; phone: string };
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "verifying" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function startPayment() {
    setStatus("loading");
    setError(null);
    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
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
        description: "Booking payment",
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
            : "Pay now"}
      </Button>
    </div>
  );
}
