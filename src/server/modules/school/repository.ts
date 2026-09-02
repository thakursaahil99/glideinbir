import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@prisma/client";

export const courseRepository = {
  findMany: (where: Prisma.SchoolCourseWhereInput, skip: number, take: number) =>
    prisma.schoolCourse.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { media: { orderBy: { order: "asc" } } },
    }),
  count: (where: Prisma.SchoolCourseWhereInput) => prisma.schoolCourse.count({ where }),
  findById: (id: string) =>
    prisma.schoolCourse.findUnique({
      where: { id },
      include: { media: { orderBy: { order: "asc" } } },
    }),
  findBySlug: (slug: string) =>
    prisma.schoolCourse.findUnique({
      where: { slug },
      include: { media: { orderBy: { order: "asc" } }, faqs: true },
    }),
  create: (data: Prisma.SchoolCourseCreateInput) => prisma.schoolCourse.create({ data }),
  update: (id: string, data: Prisma.SchoolCourseUpdateInput) =>
    prisma.schoolCourse.update({ where: { id }, data }),
  delete: (id: string) => prisma.schoolCourse.delete({ where: { id } }),
};

export const courseMediaRepository = {
  create: (data: Prisma.CourseMediaCreateInput) => prisma.courseMedia.create({ data }),
  delete: (id: string) => prisma.courseMedia.delete({ where: { id } }),
};

export const instructorRepository = {
  findMany: () => prisma.instructor.findMany({ orderBy: { name: "asc" } }),
  findManyActive: () => prisma.instructor.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  findById: (id: string) => prisma.instructor.findUnique({ where: { id } }),
  findBySlug: (slug: string) => prisma.instructor.findUnique({ where: { slug } }),
  create: (data: Prisma.InstructorCreateInput) => prisma.instructor.create({ data }),
  update: (id: string, data: Prisma.InstructorUpdateInput) =>
    prisma.instructor.update({ where: { id }, data }),
  delete: (id: string) => prisma.instructor.delete({ where: { id } }),
  countBatches: (instructorId: string) => prisma.trainingBatch.count({ where: { instructorId } }),
};

export const batchRepository = {
  findForCourse: (courseId: string) =>
    prisma.trainingBatch.findMany({
      where: { courseId, status: { not: "CANCELLED" } },
      orderBy: { startDate: "asc" },
      include: { instructor: true },
    }),
  findById: (id: string) => prisma.trainingBatch.findUnique({ where: { id } }),
  create: (data: Prisma.TrainingBatchCreateInput) => prisma.trainingBatch.create({ data }),
  update: (id: string, data: Prisma.TrainingBatchUpdateInput) =>
    prisma.trainingBatch.update({ where: { id }, data }),
  delete: (id: string) => prisma.trainingBatch.delete({ where: { id } }),
};
