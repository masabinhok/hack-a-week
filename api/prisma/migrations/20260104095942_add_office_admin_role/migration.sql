/*
  Warnings:

  - A unique constraint covering the columns `[officeAdminId]` on the table `Office` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'OFFICE_ADMIN';

-- AlterTable
ALTER TABLE "Office" ADD COLUMN     "officeAdminId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Office_officeAdminId_key" ON "Office"("officeAdminId");

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_officeAdminId_fkey" FOREIGN KEY ("officeAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
