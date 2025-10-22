-- Step 1: Add isFake column to Calendar table
ALTER TABLE "Calendar" ADD COLUMN "isFake" BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Create a fake calendar for year 1996
INSERT INTO "Calendar" (year, title, description, "isPublished", "isFake", "createdAt", "updatedAt")
VALUES (1996, 'Test Calendar 1996', 'A test calendar with fake pictures for demo purposes', true, true, NOW(), NOW())
ON CONFLICT (year) DO UPDATE SET "isFake" = true;

-- Step 3: Migrate DummyPicture data to Picture table
INSERT INTO "Picture" (day, year, key, "isOpenable", "isOpen", date)
SELECT day, year, key, "isOpenable", "isOpen", date
FROM "DummyPicture"
ON CONFLICT (day, year) DO NOTHING;

-- Step 4: Drop the DummyPicture table
DROP TABLE "DummyPicture";
