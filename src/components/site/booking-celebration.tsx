"use client";

import { useEffect, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { CircleCheck } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { ConfettiBurst } from "@/components/effects/confetti-burst";

const FLAG_PREFIX = "glideinbir:just-confirmed:";

// PaymentPanel sets this flag right before router.refresh() on a
// successful confirm. We only get to see the "it just happened" moment
// once — a later visit to the same (already-confirmed) booking page
// should render calmly, not re-explode confetti every time.
export function markJustConfirmed(bookingId: string) {
  try {
    sessionStorage.setItem(`${FLAG_PREFIX}${bookingId}`, "1");
  } catch {
    // sessionStorage can throw in private-browsing contexts — celebration
    // is a nice-to-have, never worth failing the payment flow over.
  }
}

function noopSubscribe() {
  return () => {};
}

function getServerSnapshot() {
  return false;
}

// sessionStorage doesn't exist during SSR, so we read it the same way
// use-reduced-motion.ts reads matchMedia: via useSyncExternalStore with a
// server snapshot of `false`. That keeps the server-rendered HTML and the
// client's first hydration pass in agreement (no mismatch), and correctly
// picks up the flag right after mount.
export function BookingCelebration({ bookingId }: { bookingId: string }) {
  const key = `${FLAG_PREFIX}${bookingId}`;
  const justConfirmed = useSyncExternalStore(
    noopSubscribe,
    () => {
      try {
        return sessionStorage.getItem(key) === "1";
      } catch {
        return false;
      }
    },
    getServerSnapshot,
  );

  // Clear the flag once we've read it, so a later visit to this same
  // (already-confirmed) booking doesn't celebrate again. This mutates
  // sessionStorage only — it never calls a state setter, so it can't
  // trigger a cascading render.
  useEffect(() => {
    if (!justConfirmed) return;
    try {
      sessionStorage.removeItem(key);
    } catch {
      // ignore — see markJustConfirmed
    }
  }, [justConfirmed, key]);

  return (
    <div className="text-center">
      {justConfirmed && <ConfettiBurst />}
      <motion.div
        initial={justConfirmed ? { scale: 0.4, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50"
      >
        <CircleCheck className="h-9 w-9 text-emerald-600" strokeWidth={2} />
      </motion.div>
      <p className="mt-4 text-lg font-semibold">
        {justConfirmed ? "You're all booked! 🎉" : "Your booking is confirmed"}
      </p>
      <p className="mt-1 text-sm text-muted">
        A confirmation has been saved to your account — see you in Bir Billing.
      </p>
      <LinkButton href="/account/bookings" variant="ghost" className="mt-5">
        View my bookings
      </LinkButton>
    </div>
  );
}
