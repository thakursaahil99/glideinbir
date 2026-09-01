import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { categoryRepository, itemRepository, mediaRepository, slotRepository } from "./repository";
import { slugify } from "@/lib/slugify";
import { ConflictError, NotFoundError, ValidationError } from "@/server/lib/errors";
import { recordDeletionAudit, auditSnapshot } from "@/server/lib/audit";
import type {
  categoryInputSchema,
  categoryUpdateSchema,
  itemInputSchema,
  itemUpdateSchema,
  listItemsQuerySchema,
  mediaInputSchema,
  slotInputSchema,
  slotUpdateSchema,
} from "./validation";

type CategoryInput = z.infer<typeof categoryInputSchema>;
type CategoryUpdate = z.infer<typeof categoryUpdateSchema>;
type ItemInput = z.infer<typeof itemInputSchema>;
type ItemUpdate = z.infer<typeof itemUpdateSchema>;
type ListItemsQuery = z.infer<typeof listItemsQuerySchema>;
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

  async remove(id: string, actorId: string) {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new NotFoundError("Category not found");
    const itemCount = await categoryRepository.countItems(id);
    if (itemCount > 0) {
      throw new ConflictError("Cannot delete a category that still has items");
    }
    await categoryRepository.delete(id);
    await recordDeletionAudit({
      actorId,
      entityType: "ADVENTURE_CATEGORY",
      entityId: id,
      label: existing.name,
      snapshot: existing,
    });
  },
};

async function buildItemWhere(
  query: ListItemsQuery,
  onlyActive: boolean,
): Promise<Prisma.AdventureItemWhereInput | null> {
  const where: Prisma.AdventureItemWhereInput = onlyActive ? { isActive: true } : {};
  if (query.categorySlug) {
    const category = await categoryRepository.findBySlug(query.categorySlug);
    if (!category) return null; // no such category => no matches, not an error
    where.categoryId = category.id;
  }
  if (query.pricingUnit) where.pricingUnit = query.pricingUnit;
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {
      ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
    };
  }
  return where;
}

async function listItems(query: ListItemsQuery, onlyActive: boolean) {
  const where = await buildItemWhere(query, onlyActive);
  if (!where) return { items: [], total: 0, page: query.page, pageSize: query.pageSize };

  const skip = (query.page - 1) * query.pageSize;
  const [items, total] = await Promise.all([
    itemRepository.findMany(where, skip, query.pageSize),
    itemRepository.count(where),
  ]);
  return { items, total, page: query.page, pageSize: query.pageSize };
}

export const itemService = {
  listPublic: (query: ListItemsQuery) => listItems(query, true),
  listAdmin: (query: ListItemsQuery) => listItems(query, false),

  async getBySlug(slug: string) {
    const item = await itemRepository.findBySlug(slug);
    if (!item || !item.isActive) throw new NotFoundError("Item not found");
    return item;
  },

  async getByIdForAdmin(id: string) {
    const item = await itemRepository.findById(id);
    if (!item) throw new NotFoundError("Item not found");
    return item;
  },

  async create(input: ItemInput) {
    const category = await categoryRepository.findById(input.categoryId);
    if (!category) throw new NotFoundError("Category not found");

    const { categoryId, slug, ...rest } = input;
    try {
      return await itemRepository.create({
        ...rest,
        slug: slugify(slug ?? input.title),
        category: { connect: { id: categoryId } },
      });
    } catch (error) {
      throw mapUniqueConstraint(error, "An item with this slug already exists");
    }
  },

  async update(id: string, input: ItemUpdate) {
    const existing = await itemRepository.findById(id);
    if (!existing) throw new NotFoundError("Item not found");

    const { categoryId, slug, ...rest } = input;
    if (categoryId) {
      const category = await categoryRepository.findById(categoryId);
      if (!category) throw new NotFoundError("Category not found");
    }

    const data: Prisma.AdventureItemUpdateInput = {
      ...rest,
      ...(slug ? { slug: slugify(slug) } : {}),
      ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
    };
    try {
      return await itemRepository.update(id, data);
    } catch (error) {
      throw mapUniqueConstraint(error, "An item with this slug already exists");
    }
  },

  async remove(id: string, actorId: string) {
    const existing = await itemRepository.findById(id);
    if (!existing) throw new NotFoundError("Item not found");
    const snapshot = await auditSnapshot.adventureItem(id);
    await itemRepository.delete(id);
    await recordDeletionAudit({
      actorId,
      entityType: "ADVENTURE_ITEM",
      entityId: id,
      label: existing.title,
      snapshot,
    });
  },

  async addMedia(itemId: string, input: MediaInput) {
    const existing = await itemRepository.findById(itemId);
    if (!existing) throw new NotFoundError("Item not found");
    return mediaRepository.create({ ...input, item: { connect: { id: itemId } } });
  },

  removeMedia: (mediaId: string) => mediaRepository.delete(mediaId),
};

export const slotService = {
  async listForItem(itemId: string, date?: Date) {
    const item = await itemRepository.findById(itemId);
    if (!item) throw new NotFoundError("Item not found");
    return slotRepository.findForItem(itemId, date);
  },

  async listForItemSlug(slug: string, date?: Date) {
    const item = await itemRepository.findBySlug(slug);
    if (!item || !item.isActive) throw new NotFoundError("Item not found");
    return slotRepository.findForItem(item.id, date);
  },

  async create(itemId: string, input: SlotInput) {
    const item = await itemRepository.findById(itemId);
    if (!item) throw new NotFoundError("Item not found");
    try {
      return await slotRepository.create({
        date: input.date,
        capacity: input.capacity,
        item: { connect: { id: itemId } },
      });
    } catch (error) {
      throw mapUniqueConstraint(error, "A slot already exists for this item on that date");
    }
  },

  async update(id: string, input: SlotUpdate) {
    const existing = await slotRepository.findById(id);
    if (!existing) throw new NotFoundError("Slot not found");
    if (input.capacity !== undefined && input.capacity < existing.bookedUnits) {
      throw new ValidationError(
        `Capacity cannot be less than the ${existing.bookedUnits} unit(s) already booked`,
      );
    }
    return slotRepository.update(id, input);
  },

  async remove(id: string) {
    const existing = await slotRepository.findById(id);
    if (!existing) throw new NotFoundError("Slot not found");
    if (existing.bookedUnits > 0) {
      throw new ConflictError("Cannot delete a slot that already has bookings — cancel it instead");
    }
    await slotRepository.delete(id);
  },
};
