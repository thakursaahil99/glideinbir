"use client";

import { useEffect, useState } from "react";
import { Card, Badge } from "@/components/ui/card";
import { formatDate, formatINR } from "@/lib/format";

type Payment = {
  id: string;
  razorpayOrderId: string;
  amount: string;
  status: string;
  createdAt: string;
  booking: { bookingNumber: string; customerName: string };
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((res) => res.json())
      .then((body) => setPayments(body.success ? body.data : []));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Payments</h1>

      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments?.map((payment) => (
              <tr key={payment.id} className="border-b border-border last:border-0 transition-colors hover:bg-black/[0.025]">
                <td className="px-4 py-3 font-medium">{payment.booking.bookingNumber}</td>
                <td className="px-4 py-3">{payment.booking.customerName}</td>
                <td className="px-4 py-3">{formatINR(payment.amount)}</td>
                <td className="px-4 py-3">
                  <Badge>{payment.status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(payment.createdAt)}</td>
              </tr>
            ))}
            {payments && payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
