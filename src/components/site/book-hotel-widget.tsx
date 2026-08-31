"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";

type Room = {
  id: string;
  name: string;
  type: string;
  occupancyAdults: number;
  occupancyChildren: number;
  pricePerNight: number;
  totalRooms: number;
  image: string;
};

type AvailabilityState = Record<
  string,
  { checking: boolean; available: boolean; nights: number; availableRooms: number } | undefined
>;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function BookHotelWidget({
  hotelId,
  rooms,
  isLoggedIn,
  customer,
}: {
  hotelId: string;
  rooms: Room[];
  isLoggedIn: boolean;
  customer?: { name: string; email: string; phone: string | null };
}) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(todayISO());
  const [checkOut, setCheckOut] = useState("");
  const [roomsRequested, setRoomsRequested] = useState(1);
  const [guests, setGuests] = useState(2);
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [availability, setAvailability] = useState<AvailabilityState>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [bookingRoomId, setBookingRoomId] = useState<string | null>(null);

  function checkAvailability() {
    if (!checkOut) {
      setError("Please choose a check-out date.");
      return;
    }
    setError(null);
    startTransition(async () => {
      setAvailability(Object.fromEntries(rooms.map((r) => [r.id, { checking: true, available: false, nights: 0, availableRooms: 0 }])));
      await Promise.all(
        rooms.map(async (room) => {
          const res = await fetch(
            `/api/hotels/rooms/${room.id}/availability?checkIn=${checkIn}&checkOut=${checkOut}&rooms=${roomsRequested}`,
          );
          const body = await res.json();
          setAvailability((prev) => ({
            ...prev,
            [room.id]: body.success
              ? { checking: false, available: body.data.available, nights: body.data.nights, availableRooms: body.data.availableRooms }
              : { checking: false, available: false, nights: 0, availableRooms: 0 },
          }));
        }),
      );
    });
  }

  function bookRoom(room: Room) {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!customer || phone.trim().length < 6) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError(null);
    setBookingRoomId(room.id);
    startTransition(async () => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              itemType: "HOTEL",
              hotelId,
              roomId: room.id,
              checkIn,
              checkOut,
              rooms: roomsRequested,
              guests,
            },
          ],
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: phone.trim(),
        }),
      });
      const body = await res.json();
      setBookingRoomId(null);
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Could not create booking. Please try again.");
        return;
      }
      router.push(`/booking/${body.data.id}`);
    });
  }

  return (
    <div className="space-y-8">
      <Card className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto_auto_auto]">
        <div>
          <label className="text-sm font-medium">Check-in</label>
          <input
            type="date"
            value={checkIn}
            min={todayISO()}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Check-out</label>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Rooms</label>
          <input
            type="number"
            min={1}
            value={roomsRequested}
            onChange={(e) => setRoomsRequested(Math.max(1, Number(e.target.value)))}
            className="mt-1 w-20 rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Guests</label>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
            className="mt-1 w-20 rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={checkAvailability} disabled={isPending} className="w-full">
            Check availability
          </Button>
        </div>
      </Card>

      {isLoggedIn && Object.keys(availability).length > 0 && (
        <div className="max-w-xs">
          <label className="text-sm font-medium">Contact phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="For booking updates"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {rooms.map((room) => {
          const state = availability[room.id];
          return (
            <Card key={room.id} className="card-glow-hover overflow-hidden">
              <div className="relative h-40 w-full">
                <Image src={room.image} alt={room.name} fill className="object-cover" />
              </div>
              <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{room.name}</h3>
                  <p className="text-sm text-muted">
                    {room.type} · sleeps {room.occupancyAdults + room.occupancyChildren}
                  </p>
                </div>
                <p className="font-semibold">{formatINR(room.pricePerNight)}/night</p>
              </div>

              {state && (
                <div className="mt-4">
                  {state.checking ? (
                    <p className="text-sm text-muted">Checking…</p>
                  ) : state.available ? (
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-50 text-green-700">
                        Available · {state.nights} night(s)
                      </Badge>
                      <Button
                        size="sm"
                        disabled={isPending && bookingRoomId === room.id}
                        onClick={() => bookRoom(room)}
                      >
                        {isPending && bookingRoomId === room.id
                          ? "Booking…"
                          : isLoggedIn
                            ? "Book & Pay"
                            : "Log in to book"}
                      </Button>
                    </div>
                  ) : (
                    <Badge className="bg-red-50 text-red-700">Not available for these dates</Badge>
                  )}
                </div>
              )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
