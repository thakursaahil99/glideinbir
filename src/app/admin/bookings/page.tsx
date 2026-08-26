"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, Badge } from "@/components/ui/card";
import { formatDate, formatINR } from "@/lib/format";

type Booking = {
  id: string;
  bookingNumber: string;
  customerName: string;
  status: string;
  totalAmount: string;
  createdAt: string;
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/bookings")
      .then((res) => res.json())
      .then((body) => setBookings(body.success ? body.data : []));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>

      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {bookings?.map((booking) => (
              <tr key={booking.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/bookings/${booking.id}`} className="font-medium text-brand">
                    {booking.bookingNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{booking.customerName}</td>
                <td className="px-4 py-3">
                  <Badge>{booking.status}</Badge>
                </td>
                <td className="px-4 py-3">{formatINR(booking.totalAmount)}</td>
                <td className="px-4 py-3 text-muted">{formatDate(booking.createdAt)}</td>
              </tr>
            ))}
            {bookings && bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
