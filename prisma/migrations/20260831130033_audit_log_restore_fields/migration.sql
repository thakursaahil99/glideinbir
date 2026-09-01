-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "restoredAt" TIMESTAMP(3),
ADD COLUMN     "restoredById" TEXT;

-- CreateIndex
CREATE INDEX "AuditLog_action_restoredAt_idx" ON "AuditLog"("action", "restoredAt");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_restoredById_fkey" FOREIGN KEY ("restoredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
