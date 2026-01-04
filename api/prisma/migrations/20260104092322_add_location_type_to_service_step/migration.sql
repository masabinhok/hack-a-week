-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('PERMANENT', 'CONVENIENT');

-- AlterTable
ALTER TABLE "ServiceStep" ADD COLUMN     "locationType" "LocationType" NOT NULL DEFAULT 'CONVENIENT';
