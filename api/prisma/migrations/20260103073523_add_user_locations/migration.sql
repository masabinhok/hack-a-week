/*
  Warnings:

  - You are about to drop the column `temporaryLocationCode` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_temporaryLocationCode_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "temporaryLocationCode",
ADD COLUMN     "convenientDistrictId" INTEGER,
ADD COLUMN     "convenientLocationCode" TEXT,
ADD COLUMN     "convenientMunicipalityId" INTEGER,
ADD COLUMN     "convenientProvinceId" INTEGER,
ADD COLUMN     "convenientWardId" INTEGER,
ADD COLUMN     "permanentDistrictId" INTEGER,
ADD COLUMN     "permanentMunicipalityId" INTEGER,
ADD COLUMN     "permanentProvinceId" INTEGER,
ADD COLUMN     "permanentWardId" INTEGER;

-- CreateIndex
CREATE INDEX "User_convenientLocationCode_idx" ON "User"("convenientLocationCode");

-- CreateIndex
CREATE INDEX "User_permanentDistrictId_idx" ON "User"("permanentDistrictId");

-- CreateIndex
CREATE INDEX "User_convenientDistrictId_idx" ON "User"("convenientDistrictId");
