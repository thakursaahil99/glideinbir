-- CreateTable
CREATE TABLE "SahuChatSession" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "userId" TEXT,
    "origin" TEXT NOT NULL DEFAULT 'public',
    "ipHash" TEXT,
    "userAgent" TEXT,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SahuChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SahuChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "actions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SahuChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SahuChatSession_email_idx" ON "SahuChatSession"("email");

-- CreateIndex
CREATE INDEX "SahuChatSession_userId_idx" ON "SahuChatSession"("userId");

-- CreateIndex
CREATE INDEX "SahuChatSession_lastMessageAt_idx" ON "SahuChatSession"("lastMessageAt");

-- CreateIndex
CREATE INDEX "SahuChatMessage_sessionId_createdAt_idx" ON "SahuChatMessage"("sessionId", "createdAt");

-- AddForeignKey
ALTER TABLE "SahuChatSession" ADD CONSTRAINT "SahuChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SahuChatMessage" ADD CONSTRAINT "SahuChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SahuChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
