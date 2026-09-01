import { Prisma } from "@prisma/client";
import type { z } from "zod";
import {
  hotelRepository,
  hotelMediaRepository,
  amenityRepository,
  roomRepository,
  roomMediaRepository,
  roomAvailabilityRepository,
} from "./repository";
import { slugify } from "@/lib/slugify";
import { ConflictError, NotFoundError, ValidationError } from "@/server/lib/errors";
import { recordDeletionAudit, auditSnapshot } from "@/server/lib/audit";
import type {
  hotelInputSchema,
  hotelUpdateSchema,
  listHotelsQuerySchema,
  hotelMediaInputSchema,
  amenityInputSchema,
  amenityUpdateSchema,
  roomInputSchema,
  roomUpdateSchema,
  roomMediaInputSchema,
  availabilityQuerySchema,
  availabilityOverrideSchema,
} from "./validation";

type HotelInput = z.infer<typeof hotelInputSchema>;
type HotelUpdate = z.infer<typeof hotelUpdateSchema>;
type ListHotelsQuery = z.infer<typeof listHotelsQuerySchema>;
type HotelMediaInput = z.infer<typeof hotelMediaInputSchema>;
type AmenityInput = z.infer<typeof amenityInputSchema>;
type AmenityUpdate = z.infer<typeof amenityUpdateSchema>;
type RoomInput = z.infer<typeof roomInputSchema>;
type RoomUpdate = z.infer<typeof roomUpdateSchema>;
type RoomMediaInput = z.infer<typeof roomMediaInputSchema>;
type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
type AvailabilityOverride = z.infer<typeof availabilityOverrideSchema>;

// How far ahead RoomAvailability rows are generated when a room is created.
// Extending the window further out is the "scheduled job" mentioned in
// schema.prisma — not implemented yet (no admin action needs it before a
// room's first 12 months are booked out).
const AVAILABILITY_WINDOW_DAYS = 365;

function mapUniqueConstraint(error: unknown, message: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return new ConflictError(message);
  }
  return error instanceof Error ? error : new Error(String(error));
}

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function validateAmenityIds(amenityIds: string[]) {
  if (amenityIds.length === 0) return;
  const found = await amenityRepository.findManyByIds(amenityIds);
  if (found.length !== new Set(amenityIds).size) {
    throw new ValidationError("One or more amenityIds do not exist");
  }
}

export const hotelService = {
  async listPublic(query: ListHotelsQuery) {
    const where: Prisma.HotelWhereInput = { isActive: true, ...(query.city ? { city: query.city } : {}) };
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      hotelRepository.findMany(where, skip, query.pageSize),
      hotelRepository.count(where),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async listAdmin(query: ListHotelsQuery) {
    const where: Prisma.HotelWhereInput = query.city ? { city: query.city } : {};
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      hotelRepository.findMany(where, skip, query.pageSize),
      hotelRepository.count(where),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async getBySlug(slug: string) {
    const hotel = await hotelRepository.findBySlug(slug);
    if (!hotel || !hotel.isActive) throw new NotFoundError("Hotel not found");
    return hotel;
  },

  async getByIdForAdmin(id: string) {
    const hotel = await hotelRepository.findById(id);
    if (!hotel) throw new NotFoundError("Hotel not found");
    return hotel;
  },

  async create(input: HotelInput) {
    await validateAmenityIds(input.amenityIds);
    const { slug, amenityIds, ...rest } = input;
    let hotel;
    try {
      hotel = await hotelRepository.create({ ...rest, slug: slugify(slug ?? input.name) });
    } catch (error) {
      throw mapUniqueConstraint(error, "A hotel with this slug already exists");
    }
    if (amenityIds.length > 0) await hotelRepository.syncAmenities(hotel.id, amenityIds);
    return hotelRepository.findById(hotel.id);
  },

  async update(id: string, input: HotelUpdate) {
    const existing = await hotelRepository.findById(id);
    if (!existing) throw new NotFoundError("Hotel not found");
    if (input.amenityIds) await validateAmenityIds(input.amenityIds);

    const { slug, amenityIds, ...rest } = input;
    const data = { ...rest, ...(slug ? { slug: slugify(slug) } : {}) };
    try {
      await hotelRepository.update(id, data);
    } catch (error) {
      throw mapUniqueConstraint(error, "A hotel with this slug already exists");
    }
    if (amenityIds) await hotelRepository.syncAmenities(id, amenityIds);
    return hotelRepository.findById(id);
  },

  async remove(id: string, actorId: string) {
    const existing = await hotelRepository.findById(id);
    if (!existing) throw new NotFoundError("Hotel not found");
    const snapshot = await auditSnapshot.hotel(id);
    await hotelRepository.delete(id);
    await recordDeletionAudit({
      actorId,
      entityType: "HOTEL",
      entityId: id,
      label: existing.name,
      snapshot,
    });
  },

  async addMedia(hotelId: string, input: HotelMediaInput) {
    const existing = await hotelRepository.findById(hotelId);
    if (!existing) throw new NotFoundError("Hotel not found");
    return hotelMediaRepository.create({ ...input, hotel: { connect: { id: hotelId } } });
  },

  removeMedia: (mediaId: string) => hotelMediaRepository.delete(mediaId),
};

export const amenityService = {
  list: () => amenityRepository.findMany(),

  async create(input: AmenityInput) {
    try {
      return await amenityRepository.create(input);
    } catch (error) {
      throw mapUniqueConstraint(error, "An amenity with this name already exists");
    }
  },

  async update(id: string, input: AmenityUpdate) {
    const existing = await amenityRepository.findById(id);
    if (!existing) throw new NotFoundError("Amenity not found");
    try {
      return await amenityRepository.update(id, input);
    } catch (error) {
      throw mapUniqueConstraint(error, "An amenity with this name already exists");
    }
  },

  async remove(id: string, actorId: string) {
    const existing = await amenityRepository.findById(id);
    if (!existing) throw new NotFoundError("Amenity not found");
    const snapshot = await auditSnapshot.amenity(id);
    await amenityRepository.delete(id);
    await recordDeletionAudit({
      actorId,
      entityType: "HOTEL_AMENITY",
      entityId: id,
      label: existing.name,
      snapshot,
    });
  },
};

export const roomService = {
  async listForHotel(hotelId: string) {
    const hotel = await hotelRepository.findById(hotelId);
    if (!hotel) throw new NotFoundError("Hotel not found");
    return roomRepository.findForHotel(hotelId);
  },

  async getByIdForAdmin(id: string) {
    const room = await roomRepository.findById(id);
    if (!room) throw new NotFoundError("Room not found");
    return room;
  },

  async create(hotelId: string, input: RoomInput) {
    const hotel = await hotelRepository.findById(hotelId);
    if (!hotel) throw new NotFoundError("Hotel not found");
    await validateAmenityIds(input.amenityIds);

    const { amenityIds, ...rest } = input;
    const room = await roomRepository.create({ ...rest, hotel: { connect: { id: hotelId } } });
    if (amenityIds.length > 0) await roomRepository.syncAmenities(room.id, amenityIds);

    const today = startOfDay(new Date());
    const rows = Array.from({ length: AVAILABILITY_WINDOW_DAYS }, (_, i) => {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() + i);
      return { roomId: room.id, date, totalRooms: room.totalRooms, bookedRooms: 0 };
    });
    await roomAvailabilityRepository.createMany(rows);

    return roomRepository.findById(room.id);
  },

  async update(id: string, input: RoomUpdate) {
    const existing = await roomRepository.findById(id);
    if (!existing) throw new NotFoundError("Room not found");
    if (input.amenityIds) await validateAmenityIds(input.amenityIds);

    if (input.totalRooms !== undefined && input.totalRooms !== existing.totalRooms) {
      const today = startOfDay(new Date());
      const maxBooked = await roomAvailabilityRepository.maxBookedRoomsFrom(id, today);
      if (input.totalRooms < maxBooked) {
        throw new ValidationError(
          `totalRooms cannot be less than ${maxBooked} — the most rooms already booked on a single future date`,
        );
      }
      await roomAvailabilityRepository.updateTotalRoomsFrom(id, today, input.totalRooms);
    }

    const { amenityIds, ...rest } = input;
    await roomRepository.update(id, rest);
    if (amenityIds) await roomRepository.syncAmenities(id, amenityIds);
    return roomRepository.findById(id);
  },

  async remove(id: string, actorId: string) {
    const existing = await roomRepository.findById(id);
    if (!existing) throw new NotFoundError("Room not found");
    const snapshot = await auditSnapshot.room(id);
    await roomRepository.delete(id);
    await recordDeletionAudit({
      actorId,
      entityType: "HOTEL_ROOM",
      entityId: id,
      label: existing.name,
      snapshot,
    });
  },

  async addMedia(roomId: string, input: RoomMediaInput) {
    const existing = await roomRepository.findById(roomId);
    if (!existing) throw new NotFoundError("Room not found");
    return roomMediaRepository.create({ ...input, room: { connect: { id: roomId } } });
  },

  removeMedia: (mediaId: string) => roomMediaRepository.delete(mediaId),

  async checkAvailability(roomId: string, query: AvailabilityQuery) {
    const room = await roomRepository.findById(roomId);
    if (!room) throw new NotFoundError("Room not found");

    const checkIn = startOfDay(query.checkIn);
    const checkOut = startOfDay(query.checkOut);
    const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000));

    const rows = await roomAvailabilityRepository.findRange(roomId, checkIn, checkOut);
    if (rows.length < nights) {
      // Some date in range has no generated availability row yet.
      return { available: false, nights, availableRooms: 0, checkIn, checkOut };
    }

    const availableRooms = Math.min(
      ...rows.map((row) => (row.isBlocked ? 0 : row.totalRooms - row.bookedRooms)),
    );
    return {
      available: availableRooms >= query.rooms,
      nights,
      availableRooms,
      checkIn,
      checkOut,
    };
  },

  async overrideAvailability(roomId: string, input: AvailabilityOverride) {
    const room = await roomRepository.findById(roomId);
    if (!room) throw new NotFoundError("Room not found");
    const date = startOfDay(input.date);

    const data: { isBlocked?: boolean; totalRooms?: number } = {};
    if (input.isBlocked !== undefined) data.isBlocked = input.isBlocked;
    if (input.totalRooms !== undefined) {
      const existing = await roomAvailabilityRepository.findOne(roomId, date);
      if (existing && input.totalRooms < existing.bookedRooms) {
        throw new ValidationError(
          `totalRooms cannot be less than the ${existing.bookedRooms} room(s) already booked on this date`,
        );
      }
      data.totalRooms = input.totalRooms;
    }

    return roomAvailabilityRepository.upsertOverride(roomId, date, data, room.totalRooms);
  },
};
