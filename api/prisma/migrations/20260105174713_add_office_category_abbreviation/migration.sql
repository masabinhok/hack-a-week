/*
  Warnings:

  - A unique constraint covering the columns `[abbreviation]` on the table `OfficeCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `abbreviation` to the `OfficeCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable - First add column as nullable
ALTER TABLE "OfficeCategory" ADD COLUMN "abbreviation" TEXT;

-- Update existing rows with abbreviations based on their names
UPDATE "OfficeCategory" SET "abbreviation" = 'DAO' WHERE "name" = 'DISTRICT_ADMINISTRATION_OFFICE';
UPDATE "OfficeCategory" SET "abbreviation" = 'LRO' WHERE "name" = 'LAND_REVENUE_OFFICE';
UPDATE "OfficeCategory" SET "abbreviation" = 'DEO' WHERE "name" = 'DISTRICT_EDUCATION_OFFICE';
UPDATE "OfficeCategory" SET "abbreviation" = 'TMO' WHERE "name" = 'TRANSPORT_MANAGEMENT_OFFICE';
UPDATE "OfficeCategory" SET "abbreviation" = 'DLO' WHERE "name" = 'DRIVING_LICENSE_OFFICE';
UPDATE "OfficeCategory" SET "abbreviation" = 'MUN' WHERE "name" = 'MUNICIPALITY_OFFICE';
UPDATE "OfficeCategory" SET "abbreviation" = 'RMO' WHERE "name" = 'RURAL_MUNICIPALITY_OFFICE';
UPDATE "OfficeCategory" SET "abbreviation" = 'WARD' WHERE "name" = 'WARD_OFFICE';
UPDATE "OfficeCategory" SET "abbreviation" = 'PPO' WHERE "name" = 'PASSPORT_OFFICE';
UPDATE "OfficeCategory" SET "abbreviation" = 'IMM' WHERE "name" = 'IMMIGRATION_OFFICE';
UPDATE "OfficeCategory" SET "abbreviation" = 'OCR' WHERE "name" = 'OFFICE_OF_COMPANY_REGISTRAR';
UPDATE "OfficeCategory" SET "abbreviation" = 'DCSI' WHERE "name" = 'COTTAGE_SMALL_INDUSTRY_OFFICE';
UPDATE "OfficeCategory" SET "abbreviation" = 'IRO' WHERE "name" = 'INLAND_REVENUE_OFFICE';
UPDATE "OfficeCategory" SET "abbreviation" = 'LBR' WHERE "name" = 'LABOUR_OFFICE';

-- Make column NOT NULL after populating data
ALTER TABLE "OfficeCategory" ALTER COLUMN "abbreviation" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OfficeCategory_abbreviation_key" ON "OfficeCategory"("abbreviation");

