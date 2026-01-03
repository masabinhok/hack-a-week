/*
  Warnings:

  - You are about to drop the column `officeType` on the `ServiceStep` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ServiceStep_officeType_idx";

-- AlterTable
ALTER TABLE "ServiceStep" DROP COLUMN "officeType",
ADD COLUMN     "officeTypes" "OfficeType"[];
