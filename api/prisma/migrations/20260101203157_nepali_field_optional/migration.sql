/*
  Warnings:

  - You are about to drop the column `feeTitle` on the `StepFee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DetailedProc" ALTER COLUMN "overviewNepali" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Office" ALTER COLUMN "nameNepali" DROP NOT NULL,
ALTER COLUMN "addressNepali" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StepAuthority" ALTER COLUMN "positionNepali" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StepFee" DROP COLUMN "feeTitle",
ADD COLUMN     "nameNepali" TEXT,
ALTER COLUMN "feeTitleNepali" DROP NOT NULL;
