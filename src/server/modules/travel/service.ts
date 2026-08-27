import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { routeRepository, mediaRepository, slotRepository } from "./repository";
import { slugify } from "@/lib/slugify";
import { ConflictError, NotFoundError, ValidationError } from "@/server/lib/errors";
import type {
  routeInputSchema,
  routeUpdateSchema,
  listRoutesQuerySchema,
  mediaInputSchema,
  slotInputSchema,
  slotUpdateSchema,
} from "./validation";

type RouteInput = z.infer<typeof routeInputSchema>;
type RouteUpdate = z.infer<typeof routeUpdateSchema>;
type ListRoutesQuery = z.infer<typeof listRoutesQuerySchema>;
type MediaInput = z.infer<typeof mediaInputSchema>;
type SlotInput = z.infer<typeof slotInputSchema>;
type SlotUpdate = z.infer<typeof slotUpdateSchema>;

function mapUniqueConstraint(error: unknown, message: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return new ConflictError(message);
  }
  return error instanceof Error ? error : new Error(String(error));
}

function buildRouteWhere(query: ListRoutesQuery, onlyActive: boolean): Prisma.TravelRouteWhereInput {
  const where: Prisma.TravelRouteWhereInput = onlyActive ? { isActive: true } : {};
  if (query.mode) where.mode = query.mode;
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {
      ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
    };
  }
  return where;
}

async function listRoutes(query: ListRoutesQuery, onlyActive: boolean) {
  const where = buildRouteWhere(query, onlyActive);
  const skip = (query.page - 1) * query.pageSize;
  const [items, total] = await Promise.all([
    routeRepository.findMany(where, skip, query.pageSize),
    routeRepository.count(where),
  ]);
  return { items, total, page: query.page, pageSize: query.pageSize };
}

export const routeService = {
  listPublic: (query: ListRoutesQuery) => listRoutes(query, true),
  listAdmin: (query: ListRoutesQuery) => listRoutes(query, false),

  async getBySlug(slug: string) {
    const route = await routeRepository.findBySlug(slug);
    if (!route || !route.isActive) throw new NotFoundError("Route not found");
    return route;
  },

  async getByIdForAdmin(id: string) {
    const route = await routeRepository.findById(id);
    if (!route) throw new NotFoundError("Route not found");
    return route;
  },

  async create(input: RouteInput) {
    const { slug, ...rest } = input;
    try {
      return await routeRepository.create({ ...rest, slug: slugify(slug ?? input.title) });
    } catch (error) {
      throw mapUniqueConstraint(error, "A route with this slug already exists");
    }
  },

  async update(id: string, input: RouteUpdate) {
    const existing = await routeRepository.findById(id);
    if (!existing) throw new NotFoundError("Route not found");
    const { slug, ...rest } = input;
    const data = { ...rest, ...(slug ? { slug: slugify(slug) } : {}) };
    try {
      return await routeRepository.update(id, data);
    } catch (error) {
      throw mapUniqueConstraint(error, "A route with this slug already exists");
    }
  },

  async remove(id: string) {
    const existing = await routeRepository.findById(id);
    if (!existing) throw new NotFoundError("Route not found");
    await routeRepository.delete(id);
  },

  async addMedia(routeId: string, input: MediaInput) {
    const existing = await routeRepository.findById(routeId);
    if (!existing) throw new NotFoundError("Route not found");
    return mediaRepository.create({ ...input, route: { connect: { id: routeId } } });
  },

  removeMedia: (mediaId: string) => mediaRepository.delete(mediaId),
};

export const slotService = {
  async listForRoute(routeId: string, date?: Date) {
    const route = await routeRepository.findById(routeId);
    if (!route) throw new NotFoundError("Route not found");
    return slotRepository.findForRoute(routeId, date);
  },

  async listForRouteSlug(slug: string, date?: Date) {
    const route = await routeRepository.findBySlug(slug);
    if (!route || !route.isActive) throw new NotFoundError("Route not found");
    return slotRepository.findForRoute(route.id, date);
  },

  async create(routeId: string, input: SlotInput) {
    const route = await routeRepository.findById(routeId);
    if (!route) throw new NotFoundError("Route not found");
    try {
      return await slotRepository.create({
        date: input.date,
        departureTime: input.departureTime,
        capacity: input.capacity,
        route: { connect: { id: routeId } },
      });
    } catch (error) {
      throw mapUniqueConstraint(
        error,
        "A slot already exists for this route at that date and time",
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
