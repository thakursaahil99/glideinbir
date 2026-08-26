import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { categoryRepository, packageRepository, mediaRepository, slotRepository } from "./repository";
import { slugify } from "@/lib/slugify";
import { ConflictError, NotFoundError, ValidationError } from "@/server/lib/errors";
import type {
  categoryInputSchema,
  categoryUpdateSchema,
  packageInputSchema,
  packageUpdateSchema,
  listPackagesQuerySchema,
  mediaInputSchema,
  slotInputSchema,
  slotUpdateSchema,
} from "./validation";

type CategoryInput = z.infer<typeof categoryInputSchema>;
type CategoryUpdate = z.infer<typeof categoryUpdateSchema>;
type PackageInput = z.infer<typeof packageInputSchema>;
type PackageUpdate = z.infer<typeof packageUpdateSchema>;
type ListPackagesQuery = z.infer<typeof listPackagesQuerySchema>;
type MediaInput = z.infer<typeof mediaInputSchema>;
type SlotInput = z.infer<typeof slotInputSchema>;
type SlotUpdate = z.infer<typeof slotUpdateSchema>;

function mapUniqueConstraint(error: unknown, message: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return new ConflictError(message);
  }
  return error instanceof Error ? error : new Error(String(error));
}

export const categoryService = {
  list: () => categoryRepository.findMany(),

  async create(input: CategoryInput) {
    const slug = slugify(input.slug ?? input.name);
    try {
      return await categoryRepository.create({ ...input, slug });
    } catch (error) {
      throw mapUniqueConstraint(error, "A category with this slug already exists");
    }
  },

  async update(id: string, input: CategoryUpdate) {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new NotFoundError("Category not found");
    const data = { ...input, ...(input.slug ? { slug: slugify(input.slug) } : {}) };
    try {
      return await categoryRepository.update(id, data);
    } catch (error) {
      throw mapUniqueConstraint(error, "A category with this slug already exists");
    }
  },

  async remove(id: string) {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new NotFoundError("Category not found");
    const packageCount = await categoryRepository.countPackages(id);
    if (packageCount > 0) {
      throw new ConflictError("Cannot delete a category that still has packages");
    }
    await categoryRepository.delete(id);
  },
};

async function buildPackageWhere(
  query: ListPackagesQuery,
  onlyActive: boolean,
): Promise<Prisma.ParaglidingPackageWhereInput | null> {
  const where: Prisma.ParaglidingPackageWhereInput = onlyActive ? { isActive: true } : {};
  if (query.categorySlug) {
    const category = await categoryRepository.findBySlug(query.categorySlug);
    if (!category) return null; // no such category => no matches, not an error
    where.categoryId = category.id;
  }
  if (query.flightType) where.flightType = query.flightType;
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {
      ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
    };
  }
  return where;
}

async function listPackages(query: ListPackagesQuery, onlyActive: boolean) {
  const where = await buildPackageWhere(query, onlyActive);
  if (!where) return { items: [], total: 0, page: query.page, pageSize: query.pageSize };

  const skip = (query.page - 1) * query.pageSize;
  const [items, total] = await Promise.all([
    packageRepository.findMany(where, skip, query.pageSize),
    packageRepository.count(where),
  ]);
  return { items, total, page: query.page, pageSize: query.pageSize };
}

export const packageService = {
  listPublic: (query: ListPackagesQuery) => listPackages(query, true),
  listAdmin: (query: ListPackagesQuery) => listPackages(query, false),

  async getBySlug(slug: string) {
    const pkg = await packageRepository.findBySlug(slug);
    if (!pkg || !pkg.isActive) throw new NotFoundError("Package not found");
    return pkg;
  },

  async getByIdForAdmin(id: string) {
    const pkg = await packageRepository.findById(id);
    if (!pkg) throw new NotFoundError("Package not found");
    return pkg;
  },

  async create(input: PackageInput) {
    const category = await categoryRepository.findById(input.categoryId);
    if (!category) throw new NotFoundError("Category not found");

    const { categoryId, slug, ...rest } = input;
    try {
      return await packageRepository.create({
        ...rest,
        slug: slugify(slug ?? input.title),
        category: { connect: { id: categoryId } },
      });
    } catch (error) {
      throw mapUniqueConstraint(error, "A package with this slug already exists");
    }
  },

  async update(id: string, input: PackageUpdate) {
    const existing = await packageRepository.findById(id);
    if (!existing) throw new NotFoundError("Package not found");

    const { categoryId, slug, ...rest } = input;
    if (categoryId) {
      const category = await categoryRepository.findById(categoryId);
      if (!category) throw new NotFoundError("Category not found");
    }

    const data: Prisma.ParaglidingPackageUpdateInput = {
      ...rest,
      ...(slug ? { slug: slugify(slug) } : {}),
      ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
    };
    try {
      return await packageRepository.update(id, data);
    } catch (error) {
      throw mapUniqueConstraint(error, "A package with this slug already exists");
    }
  },

  async remove(id: string) {
    const existing = await packageRepository.findById(id);
    if (!existing) throw new NotFoundError("Package not found");
    await packageRepository.delete(id);
  },

  async addMedia(packageId: string, input: MediaInput) {
    const existing = await packageRepository.findById(packageId);
    if (!existing) throw new NotFoundError("Package not found");
    return mediaRepository.create({ ...input, package: { connect: { id: packageId } } });
  },

  removeMedia: (mediaId: string) => mediaRepository.delete(mediaId),
};

export const slotService = {
  async listForPackage(packageId: string, date?: Date) {
    const pkg = await packageRepository.findById(packageId);
    if (!pkg) throw new NotFoundError("Package not found");
    return slotRepository.findForPackage(packageId, date);
  },

  async listForPackageSlug(slug: string, date?: Date) {
    const pkg = await packageRepository.findBySlug(slug);
    if (!pkg || !pkg.isActive) throw new NotFoundError("Package not found");
    return slotRepository.findForPackage(pkg.id, date);
  },

  async create(packageId: string, input: SlotInput) {
    const pkg = await packageRepository.findById(packageId);
    if (!pkg) throw new NotFoundError("Package not found");
    try {
      return await slotRepository.create({
        date: input.date,
        startTime: input.startTime,
        capacity: input.capacity,
        package: { connect: { id: packageId } },
      });
    } catch (error) {
      throw mapUniqueConstraint(
        error,
        "A slot already exists for this package at that date and time",
      );
    }
  },

  async update(id: string, input: SlotUpdate) {
    const existing = await slotRepository.findById(id);
    if (!existing) throw new NotFoundError("Slot not found");
    if (input.capacity !== undefined && input.capacity < existing.bookedSeats) {
      throw new ValidationError(
        `Capacity cannot be less than the ${existing.bookedSeats} seat(s) already booked`,
      );
    }
    return slotRepository.update(id, input);
  },

  async remove(id: string) {
    const existing = await slotRepository.findById(id);
    if (!existing) throw new NotFoundError("Slot not found");
    if (existing.bookedSeats > 0) {
      throw new ConflictError("Cannot delete a slot that already has bookings — cancel it instead");
    }
    await slotRepository.delete(id);
  },
};
