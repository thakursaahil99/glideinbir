import { Prisma, type BookingType } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { ConflictError, ForbiddenError, NotFoundError } from "@/server/lib/errors";
import { couponService } from "@/server/modules/coupon/service";
import { priceItems, getTaxRate, getServiceFee, computeBookingTotals } from "./pricing";
import { releaseBookingAvailability } from "./availability";
import type { CreateBookingInput } from "./validation";

const bookingInclude = {
  paraglidingItems: { include: { package: { include: { media: true } }, slot: true } },
  schoolItems: { include: { course: { include: { media: true } }, batch: true } },
  hotelItems: {
    include: { hotel: { include: { media: true } }, room: { include: { media: true } } },
  },
  adventureItems: { include: { item: { include: { media: true } }, slot: true } },
  travelItems: { include: { route: { include: { media: true } }, slot: true } },
  payments: true,
  coupon: true,
  reviews: true,
} satisfies Prisma.BookingInclude;

function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GLB-${year}-${random}`;
}

function resolveBookingType(itemTypes: Set<string>): BookingType {
  if (itemTypes.size > 1) return "COMBINED";
  const [only] = itemTypes;
  return only as BookingType;
}

export const bookingService = {
  async create(input: CreateBookingInput, userId: string) {
    const pricedItems = await priceItems(input.items);
    const subtotal = pricedItems.reduce((sum, item) => sum + item.lineTotal, 0);

    let discountAmount = 0;
    let couponId: string | undefined;
    if (input.couponCode) {
      const result = await couponService.validateForCheckout(input.couponCode, subtotal, userId);
      discountAmount = result.discountAmount;
      couponId = result.coupon.id;
    }

    const [taxRate, serviceFee] = await Promise.all([getTaxRate(), getServiceFee()]);
    const { taxAmount, totalAmount } = computeBookingTotals({ subtotal, discountAmount, taxRate, serviceFee });

    const type = resolveBookingType(new Set(pricedItems.map((item) => item.itemType)));

    // bookingNumber collisions are astronomically unlikely (6 base-36
    // chars) but retry a couple of times rather than trusting that.
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const booking = await prisma.$transaction(async (tx) => {
          const created = await tx.booking.create({
            data: {
              bookingNumber: generateBookingNumber(),
              userId,
              type,
              status: "PENDING",
              customerName: input.customerName,
              customerEmail: input.customerEmail,
              customerPhone: input.customerPhone,
              subtotal,
              discountAmount,
              taxAmount,
              totalAmount,
              couponId,
              notes: input.notes,
            },
          });

          for (const item of pricedItems) {
            if (item.itemType === "PARAGLIDING") {
              await tx.bookingItemParagliding.create({
                data: {
                  bookingId: created.id,
                  packageId: item.packageId,
                  slotId: item.slotId,
                  passengers: item.passengers,
                  unitPrice: item.unitPrice,
                  lineTotal: item.lineTotal,
                },
              });
            } else if (item.itemType === "SCHOOL") {
              await tx.bookingItemSchool.create({
                data: {
                  bookingId: created.id,
                  courseId: item.courseId,
                  batchId: item.batchId,
                  students: item.students,
                  unitPrice: item.unitPrice,
                  lineTotal: item.lineTotal,
                },
              });
            } else if (item.itemType === "HOTEL") {
              await tx.bookingItemHotel.create({
                data: {
                  bookingId: created.id,
                  hotelId: item.hotelId,
                  roomId: item.roomId,
                  checkIn: item.checkIn,
                  checkOut: item.checkOut,
                  nights: item.nights,
                  rooms: item.rooms,
                  guests: item.guests,
                  unitPrice: item.unitPrice,
                  lineTotal: item.lineTotal,
                },
              });
            } else if (item.itemType === "ADVENTURE") {
              await tx.bookingItemAdventure.create({
                data: {
                  bookingId: created.id,
                  itemId: item.itemId,
                  slotId: item.slotId,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  lineTotal: item.lineTotal,
                },
              });
            } else {
              await tx.bookingItemTravel.create({
                data: {
                  bookingId: created.id,
                  routeId: item.routeId,
                  slotId: item.slotId,
                  passengers: item.passengers,
                  unitPrice: item.unitPrice,
                  lineTotal: item.lineTotal,
                },
              });
            }
          }

          return created;
        });
        return bookingService.getById(booking.id, userId, false);
      } catch (error) {
        lastError = error;
        if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
          throw error;
        }
      }
    }
    throw lastError;
  },

  async getById(id: string, requestingUserId: string, isAdmin: boolean) {
    const booking = await prisma.booking.findUnique({ where: { id }, include: bookingInclude });
    if (!booking) throw new NotFoundError("Booking not found");
    if (!isAdmin && booking.userId !== requestingUserId) throw new ForbiddenError();
    return booking;
  },

  async listForUser(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      include: bookingInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  async listAdmin() {
    return prisma.booking.findMany({
      include: bookingInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  // Cancelling a paid (CONFIRMED) booking is an admin action separate from
  // the refund itself — refunding the Payment is initiated via
  // paymentService.initiateRefund and moves status to REFUND_PENDING.
  async cancel(id: string) {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundError("Booking not found");
    if (booking.status === "CANCELLED" || booking.status === "REFUNDED") {
      throw new ConflictError(`Booking is already ${booking.status}`);
    }
    if (booking.status === "CONFIRMED") {
      await releaseBookingAvailability(id);
    } else {
      await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });
    }
    return bookingService.getById(id, booking.userId, true);
  },

  // Marks a booking as delivered (flight flown, course finished, stay
  // checked out) — the gate that lets its customer leave a Review. There's
  // no automatic date-based transition yet, so an admin does this by hand.
  async complete(id: string) {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundError("Booking not found");
    if (booking.status !== "CONFIRMED") {
      throw new ConflictError("Only a confirmed booking can be marked completed");
    }
    await prisma.booking.update({ where: { id }, data: { status: "COMPLETED" } });
    return bookingService.getById(id, booking.userId, true);
  },
};
