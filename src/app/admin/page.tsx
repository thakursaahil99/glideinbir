import Link from "next/link";
import { Package, GraduationCap, Hotel, CalendarCheck, Wallet } from "lucide-react";
import { prisma } from "@/server/db/prisma";
import { Card, Badge } from "@/components/ui/card";
import { formatDate, formatINR } from "@/lib/format";
import { getCurrentUser } from "@/server/auth/guards";
import { IndexNowButton } from "@/components/admin/indexnow-button";

async function getStats() {
  const [packages, courses, hotels, bookings, revenue, recentBookings] = await Promise.all([
    prisma.paraglidingPackage.count({ where: { isActive: true } }),
    prisma.schoolCourse.count({ where: { isActive: true } }),
    prisma.hotel.count({ where: { isActive: true } }),
    prisma.booking.count(),
    prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
    prisma.booking.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        bookingNumber: true,
        customerName: true,
        status: true,
        totalAmount: true,
        createdAt: true,
      },
    }),
  ]);
  return {
    packages,
    courses,
    hotels,
    bookings,
    revenue: revenue._sum.amount?.toNumber() ?? 0,
    recentBookings,
  };
}

export default async function AdminDashboardPage() {
  const [stats, user] = await Promise.all([getStats(), getCurrentUser()]);

  const cards = [
    { label: "Active packages", value: stats.packages, icon: Package, color: "text-orange-600 bg-orange-50" },
    { label: "Active courses", value: stats.courses, icon: GraduationCap, color: "text-indigo-600 bg-indigo-50" },
    { label: "Active hotels", value: stats.hotels, icon: Hotel, color: "text-cyan-600 bg-cyan-50" },
    { label: "Total bookings", value: stats.bookings, icon: CalendarCheck, color: "text-purple-600 bg-purple-50" },
    { label: "Revenue collected", value: formatINR(stats.revenue), icon: Wallet, color: "text-green-600 bg-green-50" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">A snapshot of everything happening on Glideinbir.</p>
        </div>
        {user?.role === "SUPER_ADMIN" && <IndexNowButton />}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label} className="p-5">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}>
              <card.icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <p className="mt-3 text-sm text-muted">{card.label}</p>
            <p className="mt-1 text-2xl font-bold">{card.value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Recent bookings</h2>
        <Card className="mt-4 overflow-hidden">
          <table className="w-full text-sm">
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
              {stats.recentBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-border last:border-0 transition-colors hover:bg-black/[0.025]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/bookings/${booking.id}`} className="font-medium text-brand hover:underline">
                      {booking.bookingNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{booking.customerName}</td>
                  <td className="px-4 py-3">
                    <Badge>{booking.status}</Badge>
                  </td>
                  <td className="px-4 py-3">{formatINR(booking.totalAmount.toString())}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(booking.createdAt)}</td>
                </tr>
              ))}
              {stats.recentBookings.length === 0 && (
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
    </div>
  );
}
