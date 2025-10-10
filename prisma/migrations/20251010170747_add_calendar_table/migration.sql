-- CreateTable
CREATE TABLE "Calendar" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Calendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Calendar_year_key" ON "Calendar"("year");

-- AddForeignKey
ALTER TABLE "Picture" ADD CONSTRAINT "Picture_year_fkey" FOREIGN KEY ("year") REFERENCES "Calendar"("year") ON DELETE RESTRICT ON UPDATE CASCADE;
