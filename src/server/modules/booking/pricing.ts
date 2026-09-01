import { prisma } from "@/server/db/prisma";
import { NotFoundError, ValidationError } from "@/server/lib/errors";
import {
  packageRepository as paraglidingPackageRepository,
  slotRepository as paraglidingSlotRepository,
} from "@/server/modules/paragliding/repository";
import { courseRepository, batchRepository } from "@/server/modules/school/repository";
import {
  hotelRepository,
  roomRepository,
  roomAvailabilityRepository,
} from "@/server/modules/hotel/repository";
import {
  itemRepository as adventureItemRepository,
  slotRepository as adventureSlotRepository,
} from "@/server/modules/adventure/repository";
import {
  routeRepository as travelRouteRepository,
  slotRepository as travelSlotRepository,
} from "@/server/modules/travel/repository";
import type { BookingItemInput } from "./validation";

export type PricedItem =
  | {
      itemType: "PARAGLIDING";
      packageId: string;
      slotId: string;
      passengers: number;
      unitPrice: number;
      lineTotal: number;
    }
  | {
      itemType: "SCHOOL";
      courseId: string;
      batchId: string;
      students: number;
      unitPrice: number;
      lineTotal: number;
    }
  | {
      itemType: "HOTEL";
      hotelId: string;
      roomId: string;
      checkIn: Date;
      checkOut: Date;
      nights: number;
      rooms: number;
      guests: number;
      unitPrice: number;
      lineTotal: number;
    }
  | {
      itemType: "ADVENTURE";
      itemId: string;
      slotId: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }
  | {
      itemType: "TRAVEL";
      routeId: string;
      slotId: string;
      passengers: number;
      unitPrice: number;
      lineTotal: number;
    };

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function priceParagliding(
  item: Extract<BookingItemInput, { itemType: "PARAGLIDING" }>,
): Promise<PricedItem> {
  const pkg = await paraglidingPackageRepository.findById(item.packageId);
  if (!pkg || !pkg.isActive) throw new NotFoundError("Paragliding package not found");

  const slot = await paraglidingSlotRepository.findById(item.slotId);
  if (!slot || slot.packageId !== item.packageId || slot.status !== "ACTIVE") {
    throw new NotFoundError("Paragliding slot not found");
  }
  // Fast, non-locking pre-check for a clear error message. The real
  // guarantee comes from the row-locked transaction in availability.ts.
  if (slot.bookedSeats + item.passengers > slot.capacity) {
    throw new ValidationError("Not enough seats left in this slot");
  }

  const unitPrice = pkg.price.toNumber();
  return {
    itemType: "PARAGLIDING",
    packageId: item.packageId,
    slotId: item.slotId,
    passengers: item.passengers,
    unitPrice,
    lineTotal: unitPrice * item.passengers,
  };
}

async function priceSchool(
  item: Extract<BookingItemInput, { itemType: "SCHOOL" }>,
): Promise<PricedItem> {
  const course = await courseRepository.findById(item.courseId);
  if (!course || !course.isActive) throw new NotFoundError("Course not found");

  const batch = await batchRepository.findById(item.batchId);
  if (!batch || batch.courseId !== item.courseId || batch.status !== "UPCOMING") {
    throw new NotFoundError("Training batch not found or not open for booking");
  }
  if (batch.bookedSeats + item.students > batch.maxStudents) {
    throw new ValidationError("Not enough seats left in this batch");
  }

  const unitPrice = course.fee.toNumber();
  return {
    itemType: "SCHOOL",
    courseId: item.courseId,
    batchId: item.batchId,
    students: item.students,
    unitPrice,
    lineTotal: unitPrice * item.students,
  };
}

async function priceHotel(
  item: Extract<BookingItemInput, { itemType: "HOTEL" }>,
): Promise<PricedItem> {
  const hotel = await hotelRepository.findById(item.hotelId);
  if (!hotel || !hotel.isActive) throw new NotFoundError("Hotel not found");

  const room = await roomRepository.findById(item.roomId);
  if (!room || room.hotelId !== item.hotelId || !room.isActive) {
    throw new NotFoundError("Room not found");
  }

  const checkIn = startOfDay(item.checkIn);
  const checkOut = startOfDay(item.checkOut);
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000));

  const rows = await roomAvailabilityRepository.findRange(item.roomId, checkIn, checkOut);
  if (rows.length < nights) {
    throw new ValidationError("This room is not bookable for the full requested date range");
  }
  const availableRooms = Math.min(
    ...rows.map((row) => (row.isBlocked ? 0 : row.totalRooms - row.bookedRooms)),
  );
  if (availableRooms < item.rooms) {
    throw new ValidationError("Not enough rooms available for these dates");
  }

  const unitPrice = room.pricePerNight.toNumber();
  return {
    itemType: "HOTEL",
    hotelId: item.hotelId,
    roomId: item.roomId,
    checkIn,
    checkOut,
    nights,
    rooms: item.rooms,
    guests: item.guests,
    unitPrice,
    lineTotal: unitPrice * nights * item.rooms,
  };
}

async function priceAdventure(
  item: Extract<BookingItemInput, { itemType: "ADVENTURE" }>,
): Promise<PricedItem> {
  const adventureItem = await adventureItemRepository.findById(item.itemId);
  if (!adventureItem || !adventureItem.isActive) throw new NotFoundError("Adventure item not found");

  const slot = await adventureSlotRepository.findById(item.slotId);
  if (!slot || slot.itemId !== item.itemId || slot.status !== "ACTIVE") {
    throw new NotFoundError("Adventure slot not found");
  }
  // Fast, non-locking pre-check for a clear error message. The real
  // guarantee comes from the row-locked transaction in availability.ts.
  if (slot.bookedUnits + item.quantity > slot.capacity) {
    throw new ValidationError("Not enough capacity left in this slot");
  }

  const unitPrice = adventureItem.price.toNumber();
  return {
    itemType: "ADVENTURE",
    itemId: item.itemId,
    slotId: item.slotId,
    quantity: item.quantity,
    unitPrice,
    lineTotal: unitPrice * item.quantity,
  };
}

async function priceTravel(
  item: Extract<BookingItemInput, { itemType: "TRAVEL" }>,
): Promise<PricedItem> {
  const route = await travelRouteRepository.findById(item.routeId);
  if (!route || !route.isActive) throw new NotFoundError("Travel route not found");

  const slot = await travelSlotRepository.findById(item.slotId);
  if (!slot || slot.routeId !== item.routeId || slot.status !== "ACTIVE") {
    throw new NotFoundError("Travel slot not found");
  }
  if (slot.bookedSeats + item.passengers > slot.capacity) {
    throw new ValidationError("Not enough seats left in this departure");
  }

  const unitPrice = route.price.toNumber();
  return {
    itemType: "TRAVEL",
    routeId: item.routeId,
    slotId: item.slotId,
    passengers: item.passengers,
    unitPrice,
    lineTotal: unitPrice * item.passengers,
  };
}

export async function priceItem(item: BookingItemInput): Promise<PricedItem> {
  switch (item.itemType) {
    case "PARAGLIDING":
      return priceParagliding(item);
    case "SCHOOL":
      return priceSchool(item);
    case "HOTEL":
      return priceHotel(item);
    case "ADVENTURE":
      return priceAdventure(item);
    case "TRAVEL":
      return priceTravel(item);
  }
}

export async function priceItems(items: BookingItemInput[]): Promise<PricedItem[]> {
  return Promise.all(items.map(priceItem));
}

async function readNumericSetting(key: string): Promise<number> {
  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  return typeof setting?.value === "number" ? setting.value : 0;
}

export const getTaxRate = () => readNumericSetting("taxRate");
export const getServiceFee = () => readNumericSetting("serviceFee");

export { computeBookingTotals } from "./totals";
