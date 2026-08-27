import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@prisma/client";

export const categoryRepository = {
  findMany: () => prisma.adventureCategory.findMany({ orderBy: { order: "asc" } }),
  findById: (id: string) => prisma.adventureCategory.findUnique({ where: { id } }),
  findBySlug: (slug: string) => prisma.adventureCategory.findUnique({ where: { slug } }),
  create: (data: Prisma.AdventureCategoryCreateInput) =>
    prisma.adventureCategory.create({ data }),
  update: (id: string, data: Prisma.AdventureCategoryUpdateInput) =>
    prisma.adventureCategory.update({ where: { id }, data }),
  delete: (id: string) => prisma.adventureCategory.delete({ where: { id } }),
  countItems: (categoryId: string) => prisma.adventureItem.count({ where: { categoryId } }),
};

export const itemRepository = {
  findMany: (where: Prisma.AdventureItemWhereInput, skip: number, take: number) =>
    prisma.adventureItem.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { category: true, media: { orderBy: { order: "asc" } } },
    }),
  count: (where: Prisma.AdventureItemWhereInput) => prisma.adventureItem.count({ where }),
  findById: (id: string) =>
    prisma.adventureItem.findUnique({
      where: { id },
      include: { category: true, media: { orderBy: { order: "asc" } } },
    }),
  findBySlug: (slug: string) =>
    prisma.adventureItem.findUnique({
      where: { slug },
      include: { category: true, media: { orderBy: { order: "asc" } } },
    }),
  create: (data: Prisma.AdventureItemCreateInput) => prisma.adventureItem.create({ data }),
  update: (id: string, data: Prisma.AdventureItemUpdateInput) =>
    prisma.adventureItem.update({ where: { id }, data }),
  delete: (id: string) => prisma.adventureItem.delete({ where: { id } }),
};

export const mediaRepository = {
  create: (data: Prisma.AdventureMediaCreateInput) => prisma.adventureMedia.create({ data }),
  delete: (id: string) => prisma.adventureMedia.delete({ where: { id } }),
};

export const slotRepository = {
  findForItem: (itemId: string, date?: Date) =>
    prisma.adventureSlot.findMany({
      where: { itemId, status: "ACTIVE", ...(date ? { date } : {}) },
      orderBy: [{ date: "asc" }],
    }),
  findById: (id: string) => prisma.adventureSlot.findUnique({ where: { id } }),
  create: (data: Prisma.AdventureSlotCreateInput) => prisma.adventureSlot.create({ data }),
  update: (id: string, data: Prisma.AdventureSlotUpdateInput) =>
    prisma.adventureSlot.update({ where: { id }, data }),
  delete: (id: string) => prisma.adventureSlot.delete({ where: { id } }),
};
