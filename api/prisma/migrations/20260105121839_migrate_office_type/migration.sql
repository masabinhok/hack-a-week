/*
  Warnings:

  - You are about to drop the column `type` on the `Office` table. All the data in the column will be lost.
  - You are about to drop the column `officeTypes` on the `ServiceStep` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `OfficeCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `OfficeCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `OfficeCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Office_type_idx";

-- AlterTable
ALTER TABLE "Office" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "OfficeCategory" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ServiceStep" DROP COLUMN "officeTypes",
ADD COLUMN     "officeCategoryIds" TEXT[];

-- DropEnum
DROP TYPE "OfficeType";

-- CreateIndex
CREATE UNIQUE INDEX "OfficeCategory_slug_key" ON "OfficeCategory"("slug");
