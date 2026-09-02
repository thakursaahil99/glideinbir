import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { slugify } from "@/lib/slugify";
import { ConflictError, NotFoundError } from "@/server/lib/errors";
import { recordDeletionAudit } from "@/server/lib/audit";
import type { blogPostInputSchema, blogPostUpdateSchema } from "./validation";

type BlogPostInput = z.infer<typeof blogPostInputSchema>;
type BlogPostUpdate = z.infer<typeof blogPostUpdateSchema>;

function mapUniqueConstraint(error: unknown, message: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return new ConflictError(message);
  }
  return error instanceof Error ? error : new Error(String(error));
}

export const blogService = {
  listPublic: () =>
    prisma.blogPost.findMany({ where: { isActive: true }, orderBy: { publishedAt: "desc" } }),

  list: () => prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } }),

  async getBySlug(slug: string) {
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post || !post.isActive) throw new NotFoundError("Post not found");
    return post;
  },

  async create(input: BlogPostInput) {
    const slug = slugify(input.slug ?? input.title);
    try {
      return await prisma.blogPost.create({ data: { ...input, slug } });
    } catch (error) {
      throw mapUniqueConstraint(error, "A post with this slug already exists");
    }
  },

  async update(id: string, input: BlogPostUpdate) {
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Post not found");
    const data = { ...input, ...(input.slug ? { slug: slugify(input.slug) } : {}) };
    try {
      return await prisma.blogPost.update({ where: { id }, data });
    } catch (error) {
      throw mapUniqueConstraint(error, "A post with this slug already exists");
    }
  },

  async remove(id: string, actorId: string) {
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Post not found");
    await prisma.blogPost.delete({ where: { id } });
    await recordDeletionAudit({
      actorId,
      entityType: "BLOG_POST",
      entityId: id,
      label: existing.title,
      snapshot: existing,
    });
  },
};
