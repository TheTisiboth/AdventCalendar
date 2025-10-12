-- AlterTable
ALTER TABLE "Calendar" ADD COLUMN     "kindeUserId" TEXT;

-- CreateIndex
CREATE INDEX "Calendar_kindeUserId_idx" ON "Calendar"("kindeUserId");
