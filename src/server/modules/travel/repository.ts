import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@prisma/client";

export const routeRepository = {
  findMany: (where: Prisma.TravelRouteWhereInput, skip: number, take: number) =>
    prisma.travelRoute.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { media: { orderBy: { order: "asc" } } },
    }),
  count: (where: Prisma.TravelRouteWhereInput) => prisma.travelRoute.count({ where }),
  findById: (id: string) =>
    prisma.travelRoute.findUnique({
      where: { id },
      include: { media: { orderBy: { order: "asc" } } },
    }),
  findBySlug: (slug: string) =>
    prisma.travelRoute.findUnique({
      where: { slug },
      include: { media: { orderBy: { order: "asc" } } },
    }),
  create: (data: Prisma.TravelRouteCreateInput) => prisma.travelRoute.create({ data }),
  update: (id: string, data: Prisma.TravelRouteUpdateInput) =>
    prisma.travelRoute.update({ where: { id }, data }),
  delete: (id: string) => prisma.travelRoute.delete({ where: { id } }),
};

export const mediaRepository = {
  create: (data: Prisma.TravelMediaCreateInput) => prisma.travelMedia.create({ data }),
  delete: (id: string) => prisma.travelMedia.delete({ where: { id } }),
};

export const slotRepository = {
  findForRoute: (routeId: string, date?: Date) =>
    prisma.travelSlot.findMany({
      where: { routeId, status: "ACTIVE", ...(date ? { date } : {}) },
      orderBy: [{ date: "asc" }, { departureTime: "asc" }],
    }),
  findById: (id: string) => prisma.travelSlot.findUnique({ where: { id } }),
  create: (data: Prisma.TravelSlotCreateInput) => prisma.travelSlot.create({ data }),
  update: (id: string, data: Prisma.TravelSlotUpdateInput) =>
    prisma.travelSlot.update({ where: { id }, data }),
  delete: (id: string) => prisma.travelSlot.delete({ where: { id } }),
};
