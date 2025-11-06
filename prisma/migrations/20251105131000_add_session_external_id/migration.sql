-- AlterTable
ALTER TABLE "ConversationSession" ADD COLUMN "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ConversationSession_externalId_key" ON "ConversationSession"("externalId");


