// Deleted-data audit trail: every "top-level" admin delete (categories,
// packages/items/courses/routes, hotels, rooms, instructors, batches,
// amenities, coupons) is snapshotted here before the row is removed, so a
// Super Admin can see what was deleted, by whom, and undo it. Nested
// media/slot deletes (single photo, single date) are intentionally not
// tracked — those are frequent, low-stakes edits, not data loss.
//
// Restoring recreates the row(s) with their original ids. Booked
// state (bookedSeats/bookedUnits/bookedRooms) always comes back at 0: a
// row that still had real bookings against it could never have been
// deleted in the first place (the FK from BookingItem* is RESTRICT, so
// Prisma throws before we ever get here) — see ARCHITECTURE.md section 7.
// Room availability is regenerated fresh (same as creating a new room)
// rather than replaying stale calendar rows.

import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@prisma/client";
import { ConflictError, NotFoundError } from "@/server/lib/errors";

// The shape of a snapshotted row once it's round-tripped through JSON
// storage — every scalar/relation key is present but untyped, since it
// covers a dozen unrelated Prisma models. Restorers narrow field-by-field
// as they read it.
type Json = Record<string, unknown>;
type MediaRow = { id: string; url: string; type?: "IMAGE" | "VIDEO"; order: number };
function asMediaRows(value: unknown): MediaRow[] {
  return Array.isArray(value) ? (value as MediaRow[]) : [];
}
function asRows(value: unknown): Json[] {
  return Array.isArray(value) ? (value as Json[]) : [];
}

const AVAILABILITY_WINDOW_DAYS = 365;

export const AUDIT_ENTITY_LABELS: Record<string, string> = {
  PARAGLIDING_CATEGORY: "Paragliding category",
  PARAGLIDING_PACKAGE: "Paragliding package",
  SCHOOL_COURSE: "School course",
  SCHOOL_INSTRUCTOR: "Instructor",
  SCHOOL_BATCH: "Training batch",
  HOTEL: "Hotel",
  HOTEL_ROOM: "Room",
  HOTEL_AMENITY: "Amenity",
  ADVENTURE_CATEGORY: "Adventure category",
  ADVENTURE_ITEM: "Adventure item",
  TRAVEL_ROUTE: "Travel route",
  COUPON: "Coupon",
  REVIEW: "Review",
  FAQ: "FAQ",
  BLOG_POST: "Blog post",
};

export type AuditEntityType = keyof typeof AUDIT_ENTITY_LABELS;

// Strips class instances (Decimal, Date) down to plain JSON — exactly the
// shape Prisma's `create()` calls below expect back (strings for both).
function toPlainJson(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

// Never let a failed audit write undo (or block) a delete that already
// succeeded — best-effort logging only.
export async function recordDeletionAudit(params: {
  actorId: string;
  entityType: AuditEntityType;
  entityId: string;
  label: string;
  snapshot: unknown;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.actorId,
        action: `${params.entityType}_DELETED`,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValue: { label: params.label, data: toPlainJson(params.snapshot) } as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.error(`[audit] failed to record deletion of ${params.entityType} ${params.entityId}`, err);
  }
}

// ---------------------------------------------------------------------------
// Snapshot queries — called right before delete, inside each module's
// service.remove(). Kept in one place so every entity's "what to snapshot"
// decision is visible together.
// ---------------------------------------------------------------------------
export const auditSnapshot = {
  paraglidingCategory: (id: string) => prisma.paraglidingCategory.findUnique({ where: { id } }),
  paraglidingPackage: (id: string) =>
    prisma.paraglidingPackage.findUnique({ where: { id }, include: { media: true, slots: true } }),
  schoolCourse: (id: string) =>
    prisma.schoolCourse.findUnique({ where: { id }, include: { media: true } }),
  instructor: (id: string) => prisma.instructor.findUnique({ where: { id } }),
  trainingBatch: (id: string) => prisma.trainingBatch.findUnique({ where: { id } }),
  hotel: (id: string) =>
    prisma.hotel.findUnique({
      where: { id },
      include: {
        media: true,
        amenities: { select: { amenityId: true } },
        rooms: { include: { media: true, amenities: { select: { amenityId: true } } } },
      },
    }),
  room: (id: string) =>
    prisma.room.findUnique({
      where: { id },
      include: { media: true, amenities: { select: { amenityId: true } } },
    }),
  amenity: (id: string) =>
    prisma.amenity.findUnique({
      where: { id },
      include: { hotels: { select: { hotelId: true } }, rooms: { select: { roomId: true } } },
    }),
  adventureCategory: (id: string) => prisma.adventureCategory.findUnique({ where: { id } }),
  adventureItem: (id: string) =>
    prisma.adventureItem.findUnique({ where: { id }, include: { media: true, slots: true } }),
  travelRoute: (id: string) =>
    prisma.travelRoute.findUnique({ where: { id }, include: { media: true, slots: true } }),
  coupon: (id: string) => prisma.coupon.findUnique({ where: { id } }),
};

// ---------------------------------------------------------------------------
// Restorers — recreate a row (+ its snapshotted children) from `data`, the
// JSON blob stored in AuditLog.oldValue. Keyed by AuditEntityType.
// ---------------------------------------------------------------------------

async function stillExistingAmenityIds(amenityLinks: Json[]) {
  const ids = amenityLinks.map((a) => a.amenityId as string);
  if (!ids.length) return new Set<string>();
  const rows = await prisma.amenity.findMany({ where: { id: { in: ids } }, select: { id: true } });
  return new Set(rows.map((r) => r.id));
}

async function relinkHotelAmenities(hotelId: string, amenityLinks: Json[]) {
  const validIds = await stillExistingAmenityIds(amenityLinks);
  const rows = amenityLinks
    .map((a) => a.amenityId as string)
    .filter((amenityId) => validIds.has(amenityId))
    .map((amenityId) => ({ hotelId, amenityId }));
  if (rows.length) await prisma.hotelAmenityOnHotel.createMany({ data: rows });
}

async function relinkRoomAmenities(roomId: string, amenityLinks: Json[]) {
  const validIds = await stillExistingAmenityIds(amenityLinks);
  const rows = amenityLinks
    .map((a) => a.amenityId as string)
    .filter((amenityId) => validIds.has(amenityId))
    .map((amenityId) => ({ roomId, amenityId }));
  if (rows.length) await prisma.roomAmenityOnRoom.createMany({ data: rows });
}

async function generateRoomAvailability(roomId: string, totalRooms: number) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const rows = Array.from({ length: AVAILABILITY_WINDOW_DAYS }, (_, i) => {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() + i);
    return { roomId, date, totalRooms, bookedRooms: 0 };
  });
  await prisma.roomAvailability.createMany({ data: rows, skipDuplicates: true });
}

async function restoreParaglidingCategory(d: Json) {
  const { id, name, slug, description, isActive, order } = d;
  await prisma.paraglidingCategory.create({
    data: { id, name, slug, description, isActive, order } as Prisma.ParaglidingCategoryCreateInput,
  });
  return { id: id as string };
}

async function restoreParaglidingPackage(d: Json) {
  const { media, slots, category: _category, ...pkg } = d;
  await prisma.paraglidingPackage.create({ data: pkg as Prisma.ParaglidingPackageUncheckedCreateInput });
  const packageId = pkg.id as string;
  const mediaRows = asMediaRows(media);
  if (mediaRows.length) {
    await prisma.paraglidingMedia.createMany({
      data: mediaRows.map((m) => ({ id: m.id, packageId, url: m.url, type: m.type, order: m.order })),
    });
  }
  const slotRows = asRows(slots);
  if (slotRows.length) {
    await prisma.paraglidingSlot.createMany({
      data: slotRows.map((s) => ({ ...s, packageId, bookedSeats: 0 }) as Prisma.ParaglidingSlotCreateManyInput),
    });
  }
  return { id: packageId };
}

async function restoreSchoolCourse(d: Json) {
  const { media, ...course } = d;
  await prisma.schoolCourse.create({ data: course as Prisma.SchoolCourseCreateInput });
  const courseId = course.id as string;
  const mediaRows = asMediaRows(media);
  if (mediaRows.length) {
    await prisma.courseMedia.createMany({
      data: mediaRows.map((m) => ({ id: m.id, courseId, url: m.url, type: m.type, order: m.order })),
    });
  }
  return { id: courseId };
}

async function restoreInstructor(d: Json) {
  const { batches: _batches, ...instructor } = d;
  await prisma.instructor.create({ data: instructor as Prisma.InstructorCreateInput });
  return { id: instructor.id as string };
}

async function restoreTrainingBatch(d: Json) {
  const { course: _course, instructor: _instructor, ...batch } = d;
  await prisma.trainingBatch.create({
    data: { ...batch, bookedSeats: 0 } as Prisma.TrainingBatchUncheckedCreateInput,
  });
  return { id: batch.id as string };
}

async function restoreHotel(d: Json) {
  const { media, amenities, rooms, ...hotel } = d;
  await prisma.hotel.create({ data: hotel as Prisma.HotelCreateInput });
  const hotelId = hotel.id as string;
  const mediaRows = asMediaRows(media);
  if (mediaRows.length) {
    await prisma.hotelMedia.createMany({
      data: mediaRows.map((m) => ({ id: m.id, hotelId, url: m.url, type: m.type, order: m.order })),
    });
  }
  await relinkHotelAmenities(hotelId, asRows(amenities));
  for (const r of asRows(rooms)) {
    const { media: roomMedia, amenities: roomAmenities, hotel: _hotel, ...room } = r;
    const roomId = room.id as string;
    await prisma.room.create({
      data: { ...room, hotelId } as Prisma.RoomUncheckedCreateInput,
    });
    const roomMediaRows = asMediaRows(roomMedia);
    if (roomMediaRows.length) {
      await prisma.roomMedia.createMany({
        data: roomMediaRows.map((m) => ({ id: m.id, roomId, url: m.url, order: m.order })),
      });
    }
    await relinkRoomAmenities(roomId, asRows(roomAmenities));
    await generateRoomAvailability(roomId, room.totalRooms as number);
  }
  return { id: hotelId };
}

async function restoreRoom(d: Json) {
  const { media, amenities, hotel: _hotel, ...room } = d;
  const hotelId = room.hotelId as string;
  const hotelStillExists = await prisma.hotel.findUnique({ where: { id: hotelId }, select: { id: true } });
  if (!hotelStillExists) {
    throw new ConflictError("Cannot restore this room — its hotel no longer exists. Restore the hotel first.");
  }
  await prisma.room.create({ data: room as Prisma.RoomUncheckedCreateInput });
  const roomId = room.id as string;
  const mediaRows = asMediaRows(media);
  if (mediaRows.length) {
    await prisma.roomMedia.createMany({
      data: mediaRows.map((m) => ({ id: m.id, roomId, url: m.url, order: m.order })),
    });
  }
  await relinkRoomAmenities(roomId, asRows(amenities));
  await generateRoomAvailability(roomId, room.totalRooms as number);
  return { id: roomId };
}

async function restoreAmenity(d: Json) {
  const { hotels, rooms, ...amenity } = d;
  await prisma.amenity.create({ data: amenity as Prisma.AmenityCreateInput });
  const amenityId = amenity.id as string;

  const hotelLinks = asRows(hotels);
  const validHotels = await prisma.hotel.findMany({
    where: { id: { in: hotelLinks.map((h) => h.hotelId as string) } },
    select: { id: true },
  });
  const validHotelIds = new Set(validHotels.map((h) => h.id));
  const hotelRows = hotelLinks
    .map((h) => h.hotelId as string)
    .filter((hotelId) => validHotelIds.has(hotelId))
    .map((hotelId) => ({ hotelId, amenityId }));
  if (hotelRows.length) await prisma.hotelAmenityOnHotel.createMany({ data: hotelRows });

  const roomLinks = asRows(rooms);
  const validRooms = await prisma.room.findMany({
    where: { id: { in: roomLinks.map((r) => r.roomId as string) } },
    select: { id: true },
  });
  const validRoomIds = new Set(validRooms.map((r) => r.id));
  const roomRows = roomLinks
    .map((r) => r.roomId as string)
    .filter((roomId) => validRoomIds.has(roomId))
    .map((roomId) => ({ roomId, amenityId }));
  if (roomRows.length) await prisma.roomAmenityOnRoom.createMany({ data: roomRows });

  return { id: amenityId };
}

async function restoreAdventureCategory(d: Json) {
  const { id, name, slug, description, isActive, order } = d;
  await prisma.adventureCategory.create({
    data: { id, name, slug, description, isActive, order } as Prisma.AdventureCategoryCreateInput,
  });
  return { id: id as string };
}

async function restoreAdventureItem(d: Json) {
  const { media, slots, category: _category, ...item } = d;
  await prisma.adventureItem.create({ data: item as Prisma.AdventureItemUncheckedCreateInput });
  const itemId = item.id as string;
  const mediaRows = asMediaRows(media);
  if (mediaRows.length) {
    await prisma.adventureMedia.createMany({
      data: mediaRows.map((m) => ({ id: m.id, itemId, url: m.url, type: m.type, order: m.order })),
    });
  }
  const slotRows = asRows(slots);
  if (slotRows.length) {
    await prisma.adventureSlot.createMany({
      data: slotRows.map((s) => ({ ...s, itemId, bookedUnits: 0 }) as Prisma.AdventureSlotCreateManyInput),
    });
  }
  return { id: itemId };
}

async function restoreTravelRoute(d: Json) {
  const { media, slots, ...route } = d;
  await prisma.travelRoute.create({ data: route as Prisma.TravelRouteCreateInput });
  const routeId = route.id as string;
  const mediaRows = asMediaRows(media);
  if (mediaRows.length) {
    await prisma.travelMedia.createMany({
      data: mediaRows.map((m) => ({ id: m.id, routeId, url: m.url, type: m.type, order: m.order })),
    });
  }
  const slotRows = asRows(slots);
  if (slotRows.length) {
    await prisma.travelSlot.createMany({
      data: slotRows.map((s) => ({ ...s, routeId, bookedSeats: 0 }) as Prisma.TravelSlotCreateManyInput),
    });
  }
  return { id: routeId };
}

async function restoreCoupon(d: Json) {
  const { bookings: _bookings, usages: _usages, ...coupon } = d;
  await prisma.coupon.create({ data: coupon as Prisma.CouponCreateInput });
  return { id: coupon.id as string };
}

async function restoreReview(d: Json) {
  const {
    user: _user,
    booking: _booking,
    paraglidingPackage: _pp,
    schoolCourse: _sc,
    hotel: _hotel,
    ...review
  } = d;
  await prisma.review.create({ data: review as Prisma.ReviewUncheckedCreateInput });
  return { id: review.id as string };
}

async function restoreFaq(d: Json) {
  const { paraglidingPackage: _pp, schoolCourse: _sc, hotel: _hotel, ...faq } = d;
  await prisma.fAQ.create({ data: faq as Prisma.FAQUncheckedCreateInput });
  return { id: faq.id as string };
}

async function restoreBlogPost(d: Json) {
  await prisma.blogPost.create({ data: d as Prisma.BlogPostCreateInput });
  return { id: d.id as string };
}

const RESTORERS: Record<AuditEntityType, (data: Json) => Promise<{ id: string }>> = {
  PARAGLIDING_CATEGORY: restoreParaglidingCategory,
  PARAGLIDING_PACKAGE: restoreParaglidingPackage,
  SCHOOL_COURSE: restoreSchoolCourse,
  SCHOOL_INSTRUCTOR: restoreInstructor,
  SCHOOL_BATCH: restoreTrainingBatch,
  HOTEL: restoreHotel,
  HOTEL_ROOM: restoreRoom,
  HOTEL_AMENITY: restoreAmenity,
  ADVENTURE_CATEGORY: restoreAdventureCategory,
  ADVENTURE_ITEM: restoreAdventureItem,
  TRAVEL_ROUTE: restoreTravelRoute,
  COUPON: restoreCoupon,
  REVIEW: restoreReview,
  FAQ: restoreFaq,
  BLOG_POST: restoreBlogPost,
};

export async function restoreAuditLog(auditLogId: string, restoredById: string) {
  const log = await prisma.auditLog.findUnique({ where: { id: auditLogId } });
  if (!log) throw new NotFoundError("Deleted record not found");
  if (log.restoredAt) throw new ConflictError("This record has already been restored");
  if (!log.action.endsWith("_DELETED")) throw new ConflictError("This log entry is not a deletion");

  const restorer = RESTORERS[log.entityType as AuditEntityType];
  if (!restorer) throw new ConflictError(`Restoring "${log.entityType}" records isn't supported`);

  const payload = log.oldValue as { label: string; data: Json } | null;
  if (!payload?.data) throw new ConflictError("This deletion has no recoverable data");

  let result: { id: string };
  try {
    result = await restorer(payload.data);
  } catch (err) {
    if (err instanceof ConflictError) throw err;
    // Most likely a unique-constraint clash (slug/code already reused by a
    // newer record created after the delete).
    throw new ConflictError(
      "Could not restore this record — something with the same slug/code may already exist.",
    );
  }

  await prisma.auditLog.update({
    where: { id: auditLogId },
    data: { restoredAt: new Date(), restoredById },
  });

  return result;
}
