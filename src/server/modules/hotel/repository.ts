import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@prisma/client";

const hotelListInclude = {
  media: { orderBy: { order: "asc" as const } },
  amenities: { include: { amenity: true } },
};

export const hotelRepository = {
  findMany: (where: Prisma.HotelWhereInput, skip: number, take: number) =>
    prisma.hotel.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: hotelListInclude }),
  count: (where: Prisma.HotelWhereInput) => prisma.hotel.count({ where }),
  findById: (id: string) =>
    prisma.hotel.findUnique({ where: { id }, include: hotelListInclude }),
  findBySlug: (slug: string) =>
    prisma.hotel.findUnique({
      where: { slug },
      include: {
        ...hotelListInclude,
        rooms: {
          where: { isActive: true },
          include: { media: { orderBy: { order: "asc" } }, amenities: { include: { amenity: true } } },
        },
        faqs: true,
      },
    }),
  create: (data: Prisma.HotelCreateInput) => prisma.hotel.create({ data }),
  update: (id: string, data: Prisma.HotelUpdateInput) =>
    prisma.hotel.update({ where: { id }, data }),
  delete: (id: string) => prisma.hotel.delete({ where: { id } }),
  syncAmenities: (hotelId: string, amenityIds: string[]) =>
    prisma.$transaction([
      prisma.hotelAmenityOnHotel.deleteMany({ where: { hotelId } }),
      prisma.hotelAmenityOnHotel.createMany({
        data: amenityIds.map((amenityId) => ({ hotelId, amenityId })),
        skipDuplicates: true,
      }),
    ]),
};

export const hotelMediaRepository = {
  create: (data: Prisma.HotelMediaCreateInput) => prisma.hotelMedia.create({ data }),
  delete: (id: string) => prisma.hotelMedia.delete({ where: { id } }),
};

export const amenityRepository = {
  findMany: () => prisma.amenity.findMany({ orderBy: { name: "asc" } }),
  findById: (id: string) => prisma.amenity.findUnique({ where: { id } }),
  findManyByIds: (ids: string[]) => prisma.amenity.findMany({ where: { id: { in: ids } } }),
  create: (data: Prisma.AmenityCreateInput) => prisma.amenity.create({ data }),
  update: (id: string, data: Prisma.AmenityUpdateInput) =>
    prisma.amenity.update({ where: { id }, data }),
  delete: (id: string) => prisma.amenity.delete({ where: { id } }),
};

export const roomRepository = {
  findForHotel: (hotelId: string) =>
    prisma.room.findMany({
      where: { hotelId },
      orderBy: { createdAt: "asc" },
      include: { media: { orderBy: { order: "asc" } }, amenities: { include: { amenity: true } } },
    }),
  findById: (id: string) =>
    prisma.room.findUnique({
      where: { id },
      include: { media: { orderBy: { order: "asc" } }, amenities: { include: { amenity: true } } },
    }),
  create: (data: Prisma.RoomCreateInput) => prisma.room.create({ data }),
  update: (id: string, data: Prisma.RoomUpdateInput) => prisma.room.update({ where: { id }, data }),
  delete: (id: string) => prisma.room.delete({ where: { id } }),
  syncAmenities: (roomId: string, amenityIds: string[]) =>
    prisma.$transaction([
      prisma.roomAmenityOnRoom.deleteMany({ where: { roomId } }),
      prisma.roomAmenityOnRoom.createMany({
        data: amenityIds.map((amenityId) => ({ roomId, amenityId })),
        skipDuplicates: true,
      }),
    ]),
};

export const roomMediaRepository = {
  create: (data: Prisma.RoomMediaCreateInput) => prisma.roomMedia.create({ data }),
  delete: (id: string) => prisma.roomMedia.delete({ where: { id } }),
};

export const roomAvailabilityRepository = {
  createMany: (rows: Prisma.RoomAvailabilityCreateManyInput[]) =>
    prisma.roomAvailability.createMany({ data: rows, skipDuplicates: true }),
  findRange: (roomId: string, from: Date, to: Date) =>
    prisma.roomAvailability.findMany({
      where: { roomId, date: { gte: from, lt: to } },
      orderBy: { date: "asc" },
    }),
  findOne: (roomId: string, date: Date) =>
    prisma.roomAvailability.findUnique({ where: { roomId_date: { roomId, date } } }),
  updateTotalRoomsFrom: (roomId: string, from: Date, totalRooms: number) =>
    prisma.roomAvailability.updateMany({
      where: { roomId, date: { gte: from } },
      data: { totalRooms },
    }),
  maxBookedRoomsFrom: async (roomId: string, from: Date) => {
    const result = await prisma.roomAvailability.aggregate({
      where: { roomId, date: { gte: from } },
      _max: { bookedRooms: true },
    });
    return result._max.bookedRooms ?? 0;
  },
  upsertOverride: (
    roomId: string,
    date: Date,
    data: { isBlocked?: boolean; totalRooms?: number },
    defaultTotalRooms: number,
  ) =>
    prisma.roomAvailability.upsert({
      where: { roomId_date: { roomId, date } },
      update: data,
      create: {
        room: { connect: { id: roomId } },
        date,
        totalRooms: data.totalRooms ?? defaultTotalRooms,
        isBlocked: data.isBlocked,
      },
    }),
};
