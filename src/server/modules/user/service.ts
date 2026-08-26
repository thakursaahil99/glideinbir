import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { hashPassword } from "@/server/auth/password";
import { destroyAllSessionsForUser } from "@/server/auth/session";
import { ConflictError, ForbiddenError, NotFoundError } from "@/server/lib/errors";
import type { createStaffSchema, updateUserSchema } from "./validation";

type CreateStaffInput = z.infer<typeof createStaffSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const userService = {
  list: () => prisma.user.findMany({ select: safeUserSelect, orderBy: { createdAt: "desc" } }),

  async createStaff(input: CreateStaffInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictError("An account with this email already exists");

    const passwordHash = await hashPassword(input.password);
    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
        emailVerifiedAt: new Date(),
      },
      select: safeUserSelect,
    });
  },

  // A Super Admin can't demote or deactivate their own account — that's
  // how you end up with zero admins able to fix it back.
  async update(id: string, actorId: string, input: UpdateUserInput) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("User not found");
    if (id === actorId && (input.role !== undefined || input.isActive === false)) {
      throw new ForbiddenError("You can't change your own role or deactivate your own account");
    }

    const updated = await prisma.user.update({ where: { id }, data: input, select: safeUserSelect });

    // Revoke sessions on any role/active change so the new permissions
    // take effect immediately instead of on the old session's next login.
    if (input.role !== undefined || input.isActive === false) {
      await destroyAllSessionsForUser(id);
    }
    return updated;
  },
};
