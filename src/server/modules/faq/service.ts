import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { NotFoundError } from "@/server/lib/errors";
import { recordDeletionAudit } from "@/server/lib/audit";
import type { faqInputSchema, faqUpdateSchema } from "./validation";

type FaqInput = z.infer<typeof faqInputSchema>;
type FaqUpdate = z.infer<typeof faqUpdateSchema>;
type FaqCategory = "GENERAL" | "PARAGLIDING" | "SCHOOL" | "HOTEL";

const TARGET_FIELD: Partial<Record<FaqCategory, "paraglidingPackageId" | "schoolCourseId" | "hotelId">> = {
  PARAGLIDING: "paraglidingPackageId",
  SCHOOL: "schoolCourseId",
  HOTEL: "hotelId",
};

export const faqService = {
  // Used on a detail page: FAQs linked to this exact package/course/hotel,
  // plus category-general ones (same category, linked to nothing specific)
  // — never GENERAL-category FAQs, those are for the standalone /faq page.
  async listForTarget(category: Exclude<FaqCategory, "GENERAL">, targetId: string) {
    const field = TARGET_FIELD[category]!;
    return prisma.fAQ.findMany({
      where: {
        isActive: true,
        OR: [{ [field]: targetId }, { category, paraglidingPackageId: null, schoolCourseId: null, hotelId: null }],
      },
      orderBy: { order: "asc" },
    });
  },

  // Every active FAQ, grouped for the standalone /faq page.
  listAllActive: () => prisma.fAQ.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),

  list: () =>
    prisma.fAQ.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
      include: {
        paraglidingPackage: { select: { title: true } },
        schoolCourse: { select: { title: true } },
        hotel: { select: { name: true } },
      },
    }),

  async create(input: FaqInput) {
    const { paraglidingPackageId, schoolCourseId, hotelId, ...rest } = input;
    return prisma.fAQ.create({
      data: {
        ...rest,
        ...(paraglidingPackageId ? { paraglidingPackage: { connect: { id: paraglidingPackageId } } } : {}),
        ...(schoolCourseId ? { schoolCourse: { connect: { id: schoolCourseId } } } : {}),
        ...(hotelId ? { hotel: { connect: { id: hotelId } } } : {}),
      },
    });
  },

  async update(id: string, input: FaqUpdate) {
    const existing = await prisma.fAQ.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("FAQ not found");
    const { paraglidingPackageId, schoolCourseId, hotelId, ...rest } = input;
    const data: Prisma.FAQUpdateInput = {
      ...rest,
      ...(paraglidingPackageId !== undefined
        ? { paraglidingPackage: paraglidingPackageId ? { connect: { id: paraglidingPackageId } } : { disconnect: true } }
        : {}),
      ...(schoolCourseId !== undefined
        ? { schoolCourse: schoolCourseId ? { connect: { id: schoolCourseId } } : { disconnect: true } }
        : {}),
      ...(hotelId !== undefined
        ? { hotel: hotelId ? { connect: { id: hotelId } } : { disconnect: true } }
        : {}),
    };
    return prisma.fAQ.update({ where: { id }, data });
  },

  async remove(id: string, actorId: string) {
    const existing = await prisma.fAQ.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("FAQ not found");
    await prisma.fAQ.delete({ where: { id } });
    await recordDeletionAudit({
      actorId,
      entityType: "FAQ",
      entityId: id,
      label: existing.question,
      snapshot: existing,
    });
  },
};
