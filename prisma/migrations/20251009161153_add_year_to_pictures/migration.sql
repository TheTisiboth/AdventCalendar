-- DropIndex
DROP INDEX "Picture_day_key";

-- DropIndex
DROP INDEX "DummyPicture_day_key";

-- AlterTable
ALTER TABLE "Picture" ADD COLUMN "year" INTEGER NOT NULL DEFAULT 2023;

-- AlterTable
ALTER TABLE "DummyPicture" ADD COLUMN "year" INTEGER NOT NULL DEFAULT 2023;

-- CreateIndex
CREATE UNIQUE INDEX "Picture_day_year_key" ON "Picture"("day", "year");

-- CreateIndex
CREATE UNIQUE INDEX "DummyPicture_day_year_key" ON "DummyPicture"("day", "year");
