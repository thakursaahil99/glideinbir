import type { ComponentProps } from "react";
import type { Badge } from "@/components/ui/card";

type BadgeTone = NonNullable<ComponentProps<typeof Badge>["tone"]>;

// Shared status → Badge tone mapping for the various status enums used
// across bookings, payments, and batches — same handful of words
// (confirmed/pending/cancelled-ish) recur everywhere, so one mapping
// keeps them all colored consistently instead of every page picking its
// own colors.
export function statusTone(status: string): BadgeTone {
  switch (status) {
    case "CONFIRMED":
    case "COMPLETED":
    case "SUCCESS":
    case "ONGOING":
      return "success";
    case "CANCELLED":
    case "FAILED":
      return "danger";
    case "PENDING":
    case "REFUND_PENDING":
    case "UPCOMING":
      return "amber";
    case "REFUNDED":
      return "info";
    default:
      return "neutral";
  }
}
