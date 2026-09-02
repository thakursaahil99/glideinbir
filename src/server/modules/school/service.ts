import { Prisma } from "@prisma/client";
import type { z } from "zod";
import {
  courseRepository,
  courseMediaRepository,
  instructorRepository,
  batchRepository,
} from "./repository";
import { slugify } from "@/lib/slugify";
import { ConflictError, NotFoundError, ValidationError } from "@/server/lib/errors";
import { recordDeletionAudit } from "@/server/lib/audit";
import type {
  courseInputSchema,
  courseUpdateSchema,
  listCoursesQuerySchema,
  courseMediaInputSchema,
  instructorInputSchema,
  instructorUpdateSchema,
  batchInputSchema,
  batchUpdateSchema,
} from "./validation";

type CourseInput = z.infer<typeof courseInputSchema>;
type CourseUpdate = z.infer<typeof courseUpdateSchema>;
type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;
type CourseMediaInput = z.infer<typeof courseMediaInputSchema>;
type InstructorInput = z.infer<typeof instructorInputSchema>;
type InstructorUpdate = z.infer<typeof instructorUpdateSchema>;
type BatchInput = z.infer<typeof batchInputSchema>;
type BatchUpdate = z.infer<typeof batchUpdateSchema>;

function mapUniqueConstraint(error: unknown, message: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return new ConflictError(message);
  }
  return error instanceof Error ? error : new Error(String(error));
}

async function listCourses(query: ListCoursesQuery, onlyActive: boolean) {
  const where: Prisma.SchoolCourseWhereInput = onlyActive ? { isActive: true } : {};
  if (query.level) where.level = query.level;

  const skip = (query.page - 1) * query.pageSize;
  const [items, total] = await Promise.all([
    courseRepository.findMany(where, skip, query.pageSize),
    courseRepository.count(where),
  ]);
  return { items, total, page: query.page, pageSize: query.pageSize };
}

export const courseService = {
  listPublic: (query: ListCoursesQuery) => listCourses(query, true),
  listAdmin: (query: ListCoursesQuery) => listCourses(query, false),

  async getBySlug(slug: string) {
    const course = await courseRepository.findBySlug(slug);
    if (!course || !course.isActive) throw new NotFoundError("Course not found");
    return course;
  },

  async getByIdForAdmin(id: string) {
    const course = await courseRepository.findById(id);
    if (!course) throw new NotFoundError("Course not found");
    return course;
  },

  async create(input: CourseInput) {
    const { slug, ...rest } = input;
    try {
      return await courseRepository.create({ ...rest, slug: slugify(slug ?? input.title) });
    } catch (error) {
      throw mapUniqueConstraint(error, "A course with this slug already exists");
    }
  },

  async update(id: string, input: CourseUpdate) {
    const existing = await courseRepository.findById(id);
    if (!existing) throw new NotFoundError("Course not found");
    const { slug, ...rest } = input;
    const data = { ...rest, ...(slug ? { slug: slugify(slug) } : {}) };
    try {
      return await courseRepository.update(id, data);
    } catch (error) {
      throw mapUniqueConstraint(error, "A course with this slug already exists");
    }
  },

  async remove(id: string, actorId: string) {
    const existing = await courseRepository.findById(id);
    if (!existing) throw new NotFoundError("Course not found");
    await courseRepository.delete(id);
    await recordDeletionAudit({
      actorId,
      entityType: "SCHOOL_COURSE",
      entityId: id,
      label: existing.title,
      snapshot: existing,
    });
  },

  async addMedia(courseId: string, input: CourseMediaInput) {
    const existing = await courseRepository.findById(courseId);
    if (!existing) throw new NotFoundError("Course not found");
    return courseMediaRepository.create({ ...input, course: { connect: { id: courseId } } });
  },

  removeMedia: (mediaId: string) => courseMediaRepository.delete(mediaId),
};

export const instructorService = {
  list: () => instructorRepository.findMany(),
  listPublic: () => instructorRepository.findManyActive(),

  async getBySlug(slug: string) {
    const instructor = await instructorRepository.findBySlug(slug);
    if (!instructor || !instructor.isActive) throw new NotFoundError("Instructor not found");
    return instructor;
  },

  async create(input: InstructorInput) {
    const slug = slugify(input.slug ?? input.name);
    try {
      return await instructorRepository.create({ ...input, slug });
    } catch (error) {
      throw mapUniqueConstraint(error, "An instructor with this slug already exists");
    }
  },

  async update(id: string, input: InstructorUpdate) {
    const existing = await instructorRepository.findById(id);
    if (!existing) throw new NotFoundError("Instructor not found");
    const data = { ...input, ...(input.slug ? { slug: slugify(input.slug) } : {}) };
    try {
      return await instructorRepository.update(id, data);
    } catch (error) {
      throw mapUniqueConstraint(error, "An instructor with this slug already exists");
    }
  },

  async remove(id: string, actorId: string) {
    const existing = await instructorRepository.findById(id);
    if (!existing) throw new NotFoundError("Instructor not found");
    const batchCount = await instructorRepository.countBatches(id);
    if (batchCount > 0) {
      throw new ConflictError("Cannot delete an instructor who still has training batches");
    }
    await instructorRepository.delete(id);
    await recordDeletionAudit({
      actorId,
      entityType: "SCHOOL_INSTRUCTOR",
      entityId: id,
      label: existing.name,
      snapshot: existing,
    });
  },
};

export const batchService = {
  async listForCourse(courseId: string) {
    const course = await courseRepository.findById(courseId);
    if (!course) throw new NotFoundError("Course not found");
    return batchRepository.findForCourse(courseId);
  },

  async listForCourseSlug(slug: string) {
    const course = await courseRepository.findBySlug(slug);
    if (!course || !course.isActive) throw new NotFoundError("Course not found");
    return batchRepository.findForCourse(course.id);
  },

  async create(courseId: string, input: BatchInput) {
    const course = await courseRepository.findById(courseId);
    if (!course) throw new NotFoundError("Course not found");
    const instructor = await instructorRepository.findById(input.instructorId);
    if (!instructor) throw new NotFoundError("Instructor not found");

    const { instructorId, ...rest } = input;
    return batchRepository.create({
      ...rest,
      course: { connect: { id: courseId } },
      instructor: { connect: { id: instructorId } },
    });
  },

  async update(id: string, input: BatchUpdate) {
    const existing = await batchRepository.findById(id);
    if (!existing) throw new NotFoundError("Batch not found");
    if (input.maxStudents !== undefined && input.maxStudents < existing.bookedSeats) {
      throw new ValidationError(
        `maxStudents cannot be less than the ${existing.bookedSeats} seat(s) already booked`,
      );
    }
    if (input.instructorId) {
      const instructor = await instructorRepository.findById(input.instructorId);
      if (!instructor) throw new NotFoundError("Instructor not found");
    }

    const { instructorId, ...rest } = input;
    const data: Prisma.TrainingBatchUpdateInput = {
      ...rest,
      ...(instructorId ? { instructor: { connect: { id: instructorId } } } : {}),
    };
    return batchRepository.update(id, data);
  },

  async remove(id: string, actorId: string) {
    const existing = await batchRepository.findById(id);
    if (!existing) throw new NotFoundError("Batch not found");
    if (existing.bookedSeats > 0) {
      throw new ConflictError("Cannot delete a batch that already has bookings — cancel it instead");
    }
    await batchRepository.delete(id);
    await recordDeletionAudit({
      actorId,
      entityType: "SCHOOL_BATCH",
      entityId: id,
      label: `Batch starting ${new Date(existing.startDate).toISOString().slice(0, 10)}`,
      snapshot: existing,
    });
  },
};
