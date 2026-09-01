import type { z } from "zod";
import { prisma } from "@/server/db/prisma";
import type { pageContentUpdateSchema } from "./validation";

type PageContentUpdate = z.infer<typeof pageContentUpdateSchema>;

// Freeform CMS pages (Terms, Privacy, Cancellation Policy, ...) — one row
// per `key`, editable from /admin/pages without a code change. `upsert` so
// creating a brand-new page (a new key) and editing an existing one are the
// same call.
export const pageContentService = {
  getByKey: (key: string) => prisma.pageContent.findUnique({ where: { key } }),
  list: () => prisma.pageContent.findMany({ orderBy: { key: "asc" } }),
  upsert: (key: string, input: PageContentUpdate) =>
    prisma.pageContent.upsert({
      where: { key },
      create: { key, ...input },
      update: input,
    }),
};
