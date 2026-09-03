"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, Badge } from "@/components/ui/card";
import { formatDate, formatINR } from "@/lib/format";
import { TableSearch, matchesSearch } from "@/components/admin/table-search";
import { statusTone } from "@/lib/status-tone";

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
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => bookings?.filter((b) => matchesSearch(b, search)), [bookings, search]);

  useEffect(() => {
    fetch("/api/admin/bookings")
      .then((res) => res.json())
      .then((body) => setBookings(body.success ? body.data : []));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>

      <div className="mt-6">
        <TableSearch value={search} onChange={setSearch} placeholder="Search by booking number, customer…" />
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-sm">
            <thead className="border-b border-border bg-surface text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((booking) => (
                <tr key={booking.id} className="border-b border-border last:border-0 transition-colors hover:bg-black/[0.025]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/bookings/${booking.id}`} className="font-medium text-brand">
                      {booking.bookingNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{booking.customerName}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(booking.status)}>{booking.status}</Badge>
                  </td>
                  <td className="px-4 py-3">{formatINR(booking.totalAmount)}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(booking.createdAt)}</td>
                </tr>
              ))}
              {bookings && filtered && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    {search ? "No matches." : "No bookings yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
