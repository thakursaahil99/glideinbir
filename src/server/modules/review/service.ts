import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from "@/server/lib/errors";
import { recordDeletionAudit } from "@/server/lib/audit";
import type { reviewInputSchema } from "./validation";

type ReviewInput = z.infer<typeof reviewInputSchema>;
type ReviewTargetType = "PARAGLIDING" | "SCHOOL" | "HOTEL";

// Maps a review target type to the scalar FK column it's stored under —
// Review has one nullable column per target type rather than a single
// polymorphic pair, so this is the one place that needs to know all three.
const TARGET_FIELD: Record<ReviewTargetType, "paraglidingPackageId" | "schoolCourseId" | "hotelId"> = {
  PARAGLIDING: "paraglidingPackageId",
  SCHOOL: "schoolCourseId",
  HOTEL: "hotelId",
};

export const reviewService = {
  // Approved reviews for one specific package/course/hotel, newest first —
  // used on public detail pages.
  async listApproved(targetType: ReviewTargetType, targetId: string) {
    const reviews = await prisma.review.findMany({
      where: { targetType, status: "APPROVED", [TARGET_FIELD[targetType]]: targetId },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });
    const average =
      reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;
    return { reviews, average, count: reviews.length };
  },

  // Batch rating summary (average + count) for a whole list of packages/
  // courses/hotels at once — used on listing pages so a card can show its
  // star rating without an N+1 query per card.
  async getRatingSummaries(targetType: ReviewTargetType, targetIds: string[]) {
    const field = TARGET_FIELD[targetType];
    const map = new Map<string, { average: number; count: number }>();
    if (targetIds.length === 0) return map;

    const groups = await prisma.review.groupBy({
      by: [field],
      where: { targetType, status: "APPROVED", [field]: { in: targetIds } },
      _avg: { rating: true },
      _count: { rating: true },
    });
    for (const g of groups) {
      const id = g[field] as string | null;
      if (!id) continue;
      map.set(id, { average: g._avg.rating ?? 0, count: g._count.rating });
    }
    return map;
  },

  async create(input: ReviewInput, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: input.bookingId },
      include: {
        paraglidingItems: { select: { packageId: true } },
        schoolItems: { select: { courseId: true } },
        hotelItems: { select: { hotelId: true } },
      },
    });
    if (!booking) throw new NotFoundError("Booking not found");
    if (booking.userId !== userId) throw new ForbiddenError();
    if (booking.status !== "COMPLETED") {
      throw new ValidationError("You can only review a completed booking");
    }

    // The @@unique([bookingId, targetType]) constraint allows exactly one
    // review per booking per target type, so if a booking has several
    // items of the same type (e.g. two hotel rooms), the review covers
    // whichever one comes first — matching what the schema itself allows.
    const targetId =
      input.targetType === "PARAGLIDING"
        ? booking.paraglidingItems[0]?.packageId
        : input.targetType === "SCHOOL"
          ? booking.schoolItems[0]?.courseId
          : booking.hotelItems[0]?.hotelId;
    if (!targetId) {
      throw new ValidationError("This booking has nothing of that type to review");
    }

    try {
      return await prisma.review.create({
        data: {
          userId,
          bookingId: booking.id,
          targetType: input.targetType,
          rating: input.rating,
          comment: input.comment,
          [TARGET_FIELD[input.targetType]]: targetId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("You've already reviewed this booking");
      }
      throw error;
    }
  },

  // Admin moderation queue.
  list: (status?: "PENDING" | "APPROVED" | "HIDDEN") =>
    prisma.review.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        paraglidingPackage: { select: { title: true } },
        schoolCourse: { select: { title: true } },
        hotel: { select: { name: true } },
      },
    }),

  async moderate(id: string, status: "APPROVED" | "HIDDEN") {
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Review not found");
    return prisma.review.update({ where: { id }, data: { status } });
  },

  async remove(id: string, actorId: string) {
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Review not found");
    await prisma.review.delete({ where: { id } });
    await recordDeletionAudit({
      actorId,
      entityType: "REVIEW",
      entityId: id,
      label: `${existing.rating}★ review (${existing.targetType.toLowerCase()})`,
      snapshot: existing,
    });
  },
};
