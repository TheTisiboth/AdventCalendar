-- Step 1: Add isFake column to Calendar table
ALTER TABLE "Calendar" ADD COLUMN "isFake" BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Drop the DummyPicture table if it exists
DROP TABLE IF EXISTS "DummyPicture";

-- Note: Calendar seeding is now handled by prisma/seed.ts
-- This ensures both 2023 and 1996 calendars are created together
