-- AlterTable Picture: Add calendarId column (nullable initially)
ALTER TABLE "Picture" ADD COLUMN IF NOT EXISTS "calendarId" INTEGER;

-- Populate calendarId from existing year relationships
UPDATE "Picture" p
SET "calendarId" = c.id
FROM "Calendar" c
WHERE p.year = c.year AND p."calendarId" IS NULL;

-- Make calendarId NOT NULL
ALTER TABLE "Picture" ALTER COLUMN "calendarId" SET NOT NULL;

-- Drop old unique constraint on (day, year) - only if exists
DO $$ BEGIN
    ALTER TABLE "Picture" DROP CONSTRAINT IF EXISTS "Picture_day_year_key";
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Drop old foreign key constraint on year - only if exists
DO $$ BEGIN
    ALTER TABLE "Picture" DROP CONSTRAINT IF EXISTS "Picture_year_fkey";
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Add new unique constraint on (day, calendarId)
ALTER TABLE "Picture" ADD CONSTRAINT "Picture_day_calendarId_key" UNIQUE ("day", "calendarId");

-- Add new foreign key constraint on calendarId with CASCADE delete
ALTER TABLE "Picture" ADD CONSTRAINT "Picture_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop unique constraint on Calendar.year - only if exists
DO $$ BEGIN
    ALTER TABLE "Calendar" DROP CONSTRAINT IF EXISTS "Calendar_year_key";
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;
