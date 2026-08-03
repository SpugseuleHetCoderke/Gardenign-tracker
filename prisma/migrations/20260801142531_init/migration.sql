-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('WATERING', 'FERTILIZING', 'PRUNING', 'HARVESTING', 'REPOTTING', 'NOTE');

-- CreateTable
CREATE TABLE "Species" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "sunlight" TEXT NOT NULL,
    "soil" TEXT,
    "generalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareRule" (
    "id" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "intervalDays" INTEGER NOT NULL,
    "instructions" TEXT NOT NULL,

    CONSTRAINT "CareRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantInstance" (
    "id" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "nickname" TEXT,
    "location" TEXT,
    "plantedDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogEntry" (
    "id" TEXT NOT NULL,
    "plantInstanceId" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "notes" TEXT,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Species_slug_key" ON "Species"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CareRule_speciesId_activityType_key" ON "CareRule"("speciesId", "activityType");

-- CreateIndex
CREATE INDEX "LogEntry_plantInstanceId_activityType_loggedAt_idx" ON "LogEntry"("plantInstanceId", "activityType", "loggedAt");

-- AddForeignKey
ALTER TABLE "CareRule" ADD CONSTRAINT "CareRule_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantInstance" ADD CONSTRAINT "PlantInstance_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_plantInstanceId_fkey" FOREIGN KEY ("plantInstanceId") REFERENCES "PlantInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
