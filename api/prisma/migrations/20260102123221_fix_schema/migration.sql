/*
  Warnings:

  - You are about to drop the column `subServiceId` on the `DetailedProc` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `subServiceId` on the `ServiceStep` table. All the data in the column will be lost.
  - You are about to drop the column `locationCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `SubService` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubServiceOnOffice` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[serviceId]` on the table `DetailedProc` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Province` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[parentId,slug]` on the table `Service` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serviceId,step]` on the table `ServiceStep` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serviceId` to the `DetailedProc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `ServiceStep` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DetailedProc" DROP CONSTRAINT "DetailedProc_subServiceId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceStep" DROP CONSTRAINT "ServiceStep_subServiceId_fkey";

-- DropForeignKey
ALTER TABLE "SubService" DROP CONSTRAINT "SubService_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "SubServiceOnOffice" DROP CONSTRAINT "SubServiceOnOffice_officeId_fkey";

-- DropForeignKey
ALTER TABLE "SubServiceOnOffice" DROP CONSTRAINT "SubServiceOnOffice_subServiceId_fkey";

-- DropIndex
DROP INDEX "DetailedProc_subServiceId_key";

-- DropIndex
DROP INDEX "Service_category_idx";

-- DropIndex
DROP INDEX "Service_serviceId_idx";

-- DropIndex
DROP INDEX "Service_slug_key";

-- DropIndex
DROP INDEX "ServiceStep_subServiceId_idx";

-- AlterTable
ALTER TABLE "DetailedProc" DROP COLUMN "subServiceId",
ADD COLUMN     "serviceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Province" ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "category",
ADD COLUMN     "isOnlineEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "onlinePortalUrl" TEXT,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "priority" "Priority",
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "eligibility" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ServiceMetadata" ALTER COLUMN "version" DROP NOT NULL,
ALTER COLUMN "dataSource" DROP NOT NULL,
ALTER COLUMN "verifiedBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ServiceStep" DROP COLUMN "subServiceId",
ADD COLUMN     "serviceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "locationCode",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "permanentLocationCode" TEXT,
ADD COLUMN     "temporaryLocationCode" TEXT;

-- DropTable
DROP TABLE "SubService";

-- DropTable
DROP TABLE "SubServiceOnOffice";

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "ServiceCategory_serviceId_idx" ON "ServiceCategory"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceCategory_categoryId_idx" ON "ServiceCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_serviceId_categoryId_key" ON "ServiceCategory"("serviceId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "DetailedProc_serviceId_key" ON "DetailedProc"("serviceId");

-- CreateIndex
CREATE INDEX "DistrictOffice_districtId_idx" ON "DistrictOffice"("districtId");

-- CreateIndex
CREATE INDEX "MunicipalityOffice_municipalityId_idx" ON "MunicipalityOffice"("municipalityId");

-- CreateIndex
CREATE INDEX "Office_type_idx" ON "Office"("type");

-- CreateIndex
CREATE INDEX "Office_isActive_idx" ON "Office"("isActive");

-- CreateIndex
CREATE INDEX "Office_categoryId_idx" ON "Office"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Province_code_key" ON "Province"("code");

-- CreateIndex
CREATE INDEX "ProvinceOffice_provinceId_idx" ON "ProvinceOffice"("provinceId");

-- CreateIndex
CREATE INDEX "Service_parentId_idx" ON "Service"("parentId");

-- CreateIndex
CREATE INDEX "Service_level_idx" ON "Service"("level");

-- CreateIndex
CREATE UNIQUE INDEX "Service_parentId_slug_key" ON "Service"("parentId", "slug");

-- CreateIndex
CREATE INDEX "ServiceStep_serviceId_idx" ON "ServiceStep"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceStep_serviceId_step_key" ON "ServiceStep"("serviceId", "step");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_permanentLocationCode_idx" ON "User"("permanentLocationCode");

-- CreateIndex
CREATE INDEX "User_temporaryLocationCode_idx" ON "User"("temporaryLocationCode");

-- CreateIndex
CREATE INDEX "WardOffice_wardId_idx" ON "WardOffice"("wardId");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCategory" ADD CONSTRAINT "ServiceCategory_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCategory" ADD CONSTRAINT "ServiceCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceStep" ADD CONSTRAINT "ServiceStep_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailedProc" ADD CONSTRAINT "DetailedProc_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
