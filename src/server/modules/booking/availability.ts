import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export type ConfirmResult = { confirmed: true } | { confirmed: false; reason: string };

// The single place where seats/rooms are actually reserved. Called from both
// /api/payments/verify and the Razorpay webhook (ARCHITECTURE.md section 8
// step 5) — whichever request reaches here first with a still-PENDING
// booking wins; the other is a no-op against the already-CONFIRMED booking.
//
// Lock order within one booking (paragliding slots, then school batches,
// then hotel room-date rows, each sorted by id/date) matches the order
// every other booking uses, so two bookings racing over overlapping
// resources can't deadlock each other.
export async function confirmBookingAvailability(bookingId: string): Promise<ConfirmResult> {
  return prisma.$transaction(
    async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          paraglidingItems: true,
          schoolItems: true,
          hotelItems: true,
          adventureItems: true,
          travelItems: true,
        },
      });
      if (!booking) return { confirmed: false, reason: "Booking not found" };
      if (booking.status !== "PENDING") {
        return booking.status === "CONFIRMED"
          ? { confirmed: true }
          : { confirmed: false, reason: `Booking is ${booking.status}` };
      }

      const paraglidingItems = [...booking.paraglidingItems].sort((a, b) =>
        a.slotId.localeCompare(b.slotId),
      );
      const schoolItems = [...booking.schoolItems].sort((a, b) => a.batchId.localeCompare(b.batchId));
      const hotelItems = [...booking.hotelItems].sort((a, b) => a.roomId.localeCompare(b.roomId));
      const adventureItems = [...booking.adventureItems].sort((a, b) =>
        a.slotId.localeCompare(b.slotId),
      );
      const travelItems = [...booking.travelItems].sort((a, b) => a.slotId.localeCompare(b.slotId));

      for (const item of paraglidingItems) {
        const rows = await tx.$queryRaw<{ bookedSeats: number; capacity: number }[]>`
          SELECT "bookedSeats", capacity FROM "ParaglidingSlot" WHERE id = ${item.slotId} FOR UPDATE
        `;
        const slot = rows[0];
        if (!slot || slot.bookedSeats + item.passengers > slot.capacity) {
          return { confirmed: false, reason: "A paragliding slot is no longer available" };
        }
      }

      for (const item of schoolItems) {
        const rows = await tx.$queryRaw<{ bookedSeats: number; maxStudents: number }[]>`
          SELECT "bookedSeats", "maxStudents" FROM "TrainingBatch" WHERE id = ${item.batchId} FOR UPDATE
        `;
        const batch = rows[0];
        if (!batch || batch.bookedSeats + item.students > batch.maxStudents) {
          return { confirmed: false, reason: "A training batch is no longer available" };
        }
      }

      for (const item of hotelItems) {
        const nights = Math.round(
          (item.checkOut.getTime() - item.checkIn.getTime()) / (24 * 60 * 60 * 1000),
        );
        const rows = await tx.$queryRaw<
          { totalRooms: number; bookedRooms: number; isBlocked: boolean }[]
        >`
          SELECT "totalRooms", "bookedRooms", "isBlocked" FROM "RoomAvailability"
          WHERE "roomId" = ${item.roomId} AND date >= ${item.checkIn} AND date < ${item.checkOut}
          ORDER BY date FOR UPDATE
        `;
        const shortOnRooms = rows.some(
          (row) => row.isBlocked || row.bookedRooms + item.rooms > row.totalRooms,
        );
        if (rows.length < nights || shortOnRooms) {
          return { confirmed: false, reason: "A hotel room is no longer available for these dates" };
        }
      }

      for (const item of adventureItems) {
        const rows = await tx.$queryRaw<{ bookedUnits: number; capacity: number }[]>`
          SELECT "bookedUnits", capacity FROM "AdventureSlot" WHERE id = ${item.slotId} FOR UPDATE
        `;
        const slot = rows[0];
        if (!slot || slot.bookedUnits + item.quantity > slot.capacity) {
          return { confirmed: false, reason: "An adventure slot is no longer available" };
        }
      }

      for (const item of travelItems) {
        const rows = await tx.$queryRaw<{ bookedSeats: number; capacity: number }[]>`
          SELECT "bookedSeats", capacity FROM "TravelSlot" WHERE id = ${item.slotId} FOR UPDATE
        `;
        const slot = rows[0];
        if (!slot || slot.bookedSeats + item.passengers > slot.capacity) {
          return { confirmed: false, reason: "A travel departure is no longer available" };
        }
      }

      // All checks passed inside the same locked transaction — commit the increments.
      for (const item of paraglidingItems) {
        await tx.paraglidingSlot.update({
          where: { id: item.slotId },
          data: { bookedSeats: { increment: item.passengers } },
        });
      }
      for (const item of schoolItems) {
        await tx.trainingBatch.update({
          where: { id: item.batchId },
          data: { bookedSeats: { increment: item.students } },
        });
      }
      for (const item of hotelItems) {
        await tx.roomAvailability.updateMany({
          where: { roomId: item.roomId, date: { gte: item.checkIn, lt: item.checkOut } },
          data: { bookedRooms: { increment: item.rooms } },
        });
      }
      for (const item of adventureItems) {
        await tx.adventureSlot.update({
          where: { id: item.slotId },
          data: { bookedUnits: { increment: item.quantity } },
        });
      }
      for (const item of travelItems) {
        await tx.travelSlot.update({
          where: { id: item.slotId },
          data: { bookedSeats: { increment: item.passengers } },
        });
      }

      await tx.booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } });
      return { confirmed: true };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

// Mirror of confirmBookingAvailability for cancelling an already-CONFIRMED
// booking: releases the seats/rooms it was holding. No locking is needed to
// avoid overselling here (only decrements), but the same transaction keeps
// every counter update atomic with the status change.
export async function releaseBookingAvailability(bookingId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        paraglidingItems: true,
        schoolItems: true,
        hotelItems: true,
        adventureItems: true,
        travelItems: true,
      },
    });
    if (!booking || booking.status !== "CONFIRMED") return;

    for (const item of booking.paraglidingItems) {
      await tx.paraglidingSlot.update({
        where: { id: item.slotId },
        data: { bookedSeats: { decrement: item.passengers } },
      });
    }
    for (const item of booking.schoolItems) {
      await tx.trainingBatch.update({
        where: { id: item.batchId },
        data: { bookedSeats: { decrement: item.students } },
      });
    }
    for (const item of booking.hotelItems) {
      await tx.roomAvailability.updateMany({
        where: { roomId: item.roomId, date: { gte: item.checkIn, lt: item.checkOut } },
        data: { bookedRooms: { decrement: item.rooms } },
      });
    }
    for (const item of booking.adventureItems) {
      await tx.adventureSlot.update({
        where: { id: item.slotId },
        data: { bookedUnits: { decrement: item.quantity } },
      });
    }
    for (const item of booking.travelItems) {
      await tx.travelSlot.update({
        where: { id: item.slotId },
        data: { bookedSeats: { decrement: item.passengers } },
      });
    }

    await tx.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });
  });
}
