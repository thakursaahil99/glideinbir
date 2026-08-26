import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@prisma/client";

export const categoryRepository = {
  findMany: () => prisma.paraglidingCategory.findMany({ orderBy: { order: "asc" } }),
  findById: (id: string) => prisma.paraglidingCategory.findUnique({ where: { id } }),
  findBySlug: (slug: string) => prisma.paraglidingCategory.findUnique({ where: { slug } }),
  create: (data: Prisma.ParaglidingCategoryCreateInput) =>
    prisma.paraglidingCategory.create({ data }),
  update: (id: string, data: Prisma.ParaglidingCategoryUpdateInput) =>
    prisma.paraglidingCategory.update({ where: { id }, data }),
  delete: (id: string) => prisma.paraglidingCategory.delete({ where: { id } }),
  countPackages: (categoryId: string) =>
    prisma.paraglidingPackage.count({ where: { categoryId } }),
};

export const packageRepository = {
  findMany: (where: Prisma.ParaglidingPackageWhereInput, skip: number, take: number) =>
    prisma.paraglidingPackage.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { category: true, media: { orderBy: { order: "asc" } } },
    }),
  count: (where: Prisma.ParaglidingPackageWhereInput) =>
    prisma.paraglidingPackage.count({ where }),
  findById: (id: string) =>
    prisma.paraglidingPackage.findUnique({
      where: { id },
      include: { category: true, media: { orderBy: { order: "asc" } } },
    }),
  findBySlug: (slug: string) =>
    prisma.paraglidingPackage.findUnique({
      where: { slug },
      include: { category: true, media: { orderBy: { order: "asc" } }, faqs: true },
    }),
  create: (data: Prisma.ParaglidingPackageCreateInput) =>
    prisma.paraglidingPackage.create({ data }),
  update: (id: string, data: Prisma.ParaglidingPackageUpdateInput) =>
    prisma.paraglidingPackage.update({ where: { id }, data }),
  delete: (id: string) => prisma.paraglidingPackage.delete({ where: { id } }),
};

export const mediaRepository = {
  create: (data: Prisma.ParaglidingMediaCreateInput) => prisma.paraglidingMedia.create({ data }),
  delete: (id: string) => prisma.paraglidingMedia.delete({ where: { id } }),
};

export const slotRepository = {
  findForPackage: (packageId: string, date?: Date) =>
    prisma.paraglidingSlot.findMany({
      where: { packageId, status: "ACTIVE", ...(date ? { date } : {}) },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
  findById: (id: string) => prisma.paraglidingSlot.findUnique({ where: { id } }),
  create: (data: Prisma.ParaglidingSlotCreateInput) => prisma.paraglidingSlot.create({ data }),
  update: (id: string, data: Prisma.ParaglidingSlotUpdateInput) =>
    prisma.paraglidingSlot.update({ where: { id }, data }),
  delete: (id: string) => prisma.paraglidingSlot.delete({ where: { id } }),
};
