-- CreateEnum
CREATE TYPE "PlantCategory" AS ENUM ('VEGETABLE', 'HERB', 'FRUIT', 'FLOWER', 'OTHER');

-- CreateEnum
CREATE TYPE "Lifecycle" AS ENUM ('ANNUAL', 'BIENNIAL', 'PERENNIAL');

-- AlterTable
ALTER TABLE "Species" ADD COLUMN     "category" "PlantCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "commonProblems" TEXT,
ADD COLUMN     "companionPlants" TEXT,
ADD COLUMN     "harvestFromMonth" INTEGER,
ADD COLUMN     "harvestToMonth" INTEGER,
ADD COLUMN     "height" TEXT,
ADD COLUMN     "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latinName" TEXT,
ADD COLUMN     "lifecycle" "Lifecycle",
ADD COLUMN     "plantOutFromMonth" INTEGER,
ADD COLUMN     "plantOutToMonth" INTEGER,
ADD COLUMN     "sowIndoorsFromMonth" INTEGER,
ADD COLUMN     "sowIndoorsToMonth" INTEGER,
ADD COLUMN     "sowOutdoorsFromMonth" INTEGER,
ADD COLUMN     "sowOutdoorsToMonth" INTEGER,
ADD COLUMN     "spacing" TEXT,
ADD COLUMN     "waterNeeds" TEXT;
