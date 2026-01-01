-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('NPR', 'USD');

-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('GOVERNMENT', 'SERVICE', 'PENALTY', 'TAX');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('ORIGINAL', 'PHOTOCOPY', 'PHOTOGRAPH', 'PRINTOUT', 'NOTARIZED', 'CERTIFIED_COPY');

-- CreateEnum
CREATE TYPE "OfficeType" AS ENUM ('DISTRICT_ADMINISTRATION_OFFICE', 'LAND_REVENUE_OFFICE', 'DISTRICT_EDUCATION_OFFICE', 'TRANSPORT_MANAGEMENT_OFFICE', 'DRIVING_LICENSE_OFFICE', 'MUNICIPALITY_OFFICE', 'RURAL_MUNICIPALITY_OFFICE', 'WARD_OFFICE', 'PASSPORT_OFFICE', 'IMMIGRATION_OFFICE', 'OFFICE_OF_COMPANY_REGISTRAR', 'COTTAGE_SMALL_INDUSTRY_OFFICE', 'INLAND_REVENUE_OFFICE', 'LABOUR_OFFICE');

-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateTable
CREATE TABLE "Province" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameNep" TEXT,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" SERIAL NOT NULL,
    "provinceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nameNep" TEXT,
    "slug" TEXT NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Municipality" (
    "id" SERIAL NOT NULL,
    "districtId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nameNep" TEXT,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Municipality',

    CONSTRAINT "Municipality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ward" (
    "id" SERIAL NOT NULL,
    "municipalityId" INTEGER NOT NULL,
    "wardNumber" INTEGER NOT NULL,

    CONSTRAINT "Ward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eligibility" TEXT NOT NULL,
    "validityPeriod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceMetadata" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT NOT NULL,
    "dataSource" TEXT NOT NULL,
    "verifiedBy" TEXT NOT NULL,

    CONSTRAINT "ServiceMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubService" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "isOnlineEnabled" BOOLEAN NOT NULL DEFAULT false,
    "onlinePortalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceStep" (
    "id" TEXT NOT NULL,
    "subServiceId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "stepTitle" TEXT NOT NULL,
    "stepDescription" TEXT NOT NULL,
    "officeType" "OfficeType" NOT NULL,
    "requiresAppointment" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepDocument" (
    "id" SERIAL NOT NULL,
    "serviceStepId" TEXT NOT NULL,
    "docId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameNepali" TEXT NOT NULL,
    "type" "DocType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "relatedService" TEXT,
    "alternativeDocuments" TEXT[],

    CONSTRAINT "StepDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepFee" (
    "id" SERIAL NOT NULL,
    "serviceStepId" TEXT NOT NULL,
    "feeId" TEXT NOT NULL,
    "feeTitle" TEXT NOT NULL,
    "feeTitleNepali" TEXT NOT NULL,
    "feeAmount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'NPR',
    "feeType" "FeeType" NOT NULL,
    "isRefundable" BOOLEAN NOT NULL DEFAULT false,
    "applicableCondition" TEXT,
    "notes" TEXT,

    CONSTRAINT "StepFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepTimeRequired" (
    "id" SERIAL NOT NULL,
    "serviceStepId" TEXT NOT NULL,
    "minimumTime" TEXT NOT NULL,
    "maximumTime" TEXT NOT NULL,
    "averageTime" TEXT NOT NULL,
    "remarks" TEXT,
    "expeditedAvailable" BOOLEAN NOT NULL DEFAULT false,
    "workingDaysOnly" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StepTimeRequired_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepAuthority" (
    "id" SERIAL NOT NULL,
    "responsibleStepId" TEXT,
    "complaintStepId" TEXT,
    "position" TEXT NOT NULL,
    "positionNepali" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "email" TEXT,
    "complaintProcess" TEXT,
    "isResp" BOOLEAN NOT NULL,

    CONSTRAINT "StepAuthority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkingHours" (
    "id" SERIAL NOT NULL,
    "serviceStepId" TEXT NOT NULL,
    "day" "WeekDay" NOT NULL,
    "openClose" TEXT NOT NULL,

    CONSTRAINT "WorkingHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailedProc" (
    "id" TEXT NOT NULL,
    "subServiceId" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "overviewNepali" TEXT NOT NULL,
    "stepByStepGuide" TEXT[],
    "importantNotes" TEXT[],
    "legalReferences" JSONB[],
    "faqs" JSONB[],
    "commonIssues" JSONB[],

    CONSTRAINT "DetailedProc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "OfficeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Office" (
    "id" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameNepali" TEXT NOT NULL,
    "type" "OfficeType" NOT NULL,
    "address" TEXT NOT NULL,
    "addressNepali" TEXT NOT NULL,
    "contact" TEXT,
    "alternateContact" TEXT,
    "email" TEXT,
    "website" TEXT,
    "photoUrls" TEXT[],
    "facilities" TEXT[],
    "nearestLandmark" TEXT,
    "publicTransport" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WardOffice" (
    "officeId" TEXT NOT NULL,
    "wardId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "MunicipalityOffice" (
    "officeId" TEXT NOT NULL,
    "municipalityId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "DistrictOffice" (
    "officeId" TEXT NOT NULL,
    "districtId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "ProvinceOffice" (
    "officeId" TEXT NOT NULL,
    "provinceId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "OfficeRating" (
    "id" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "averageRating" DOUBLE PRECISION NOT NULL,
    "totalReviews" INTEGER NOT NULL,

    CONSTRAINT "OfficeRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubServiceOnOffice" (
    "id" TEXT NOT NULL,
    "subServiceId" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "locationBased" BOOLEAN NOT NULL DEFAULT true,
    "fetchFromAPI" BOOLEAN NOT NULL DEFAULT true,
    "apiEndpoint" TEXT,
    "remarks" TEXT,

    CONSTRAINT "SubServiceOnOffice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "locationCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Province_name_key" ON "Province"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Province_slug_key" ON "Province"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "District_name_key" ON "District"("name");

-- CreateIndex
CREATE UNIQUE INDEX "District_slug_key" ON "District"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Municipality_districtId_slug_key" ON "Municipality"("districtId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Ward_municipalityId_wardNumber_key" ON "Ward"("municipalityId", "wardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Service_serviceId_key" ON "Service"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_slug_idx" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_category_idx" ON "Service"("category");

-- CreateIndex
CREATE INDEX "Service_serviceId_idx" ON "Service"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceMetadata_serviceId_key" ON "ServiceMetadata"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "SubService_slug_key" ON "SubService"("slug");

-- CreateIndex
CREATE INDEX "SubService_serviceId_idx" ON "SubService"("serviceId");

-- CreateIndex
CREATE INDEX "SubService_isOnlineEnabled_idx" ON "SubService"("isOnlineEnabled");

-- CreateIndex
CREATE INDEX "ServiceStep_subServiceId_idx" ON "ServiceStep"("subServiceId");

-- CreateIndex
CREATE INDEX "ServiceStep_officeType_idx" ON "ServiceStep"("officeType");

-- CreateIndex
CREATE UNIQUE INDEX "StepDocument_serviceStepId_docId_key" ON "StepDocument"("serviceStepId", "docId");

-- CreateIndex
CREATE UNIQUE INDEX "StepFee_serviceStepId_feeId_key" ON "StepFee"("serviceStepId", "feeId");

-- CreateIndex
CREATE UNIQUE INDEX "StepTimeRequired_serviceStepId_key" ON "StepTimeRequired"("serviceStepId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkingHours_serviceStepId_day_key" ON "WorkingHours"("serviceStepId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "DetailedProc_subServiceId_key" ON "DetailedProc"("subServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "OfficeCategory_name_key" ON "OfficeCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Office_officeId_key" ON "Office"("officeId");

-- CreateIndex
CREATE UNIQUE INDEX "WardOffice_officeId_key" ON "WardOffice"("officeId");

-- CreateIndex
CREATE UNIQUE INDEX "MunicipalityOffice_officeId_key" ON "MunicipalityOffice"("officeId");

-- CreateIndex
CREATE UNIQUE INDEX "DistrictOffice_officeId_key" ON "DistrictOffice"("officeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProvinceOffice_officeId_key" ON "ProvinceOffice"("officeId");

-- CreateIndex
CREATE UNIQUE INDEX "OfficeRating_officeId_key" ON "OfficeRating"("officeId");

-- CreateIndex
CREATE UNIQUE INDEX "SubServiceOnOffice_subServiceId_officeId_key" ON "SubServiceOnOffice"("subServiceId", "officeId");

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Municipality" ADD CONSTRAINT "Municipality_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ward" ADD CONSTRAINT "Ward_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceMetadata" ADD CONSTRAINT "ServiceMetadata_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubService" ADD CONSTRAINT "SubService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceStep" ADD CONSTRAINT "ServiceStep_subServiceId_fkey" FOREIGN KEY ("subServiceId") REFERENCES "SubService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepDocument" ADD CONSTRAINT "StepDocument_serviceStepId_fkey" FOREIGN KEY ("serviceStepId") REFERENCES "ServiceStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepFee" ADD CONSTRAINT "StepFee_serviceStepId_fkey" FOREIGN KEY ("serviceStepId") REFERENCES "ServiceStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepTimeRequired" ADD CONSTRAINT "StepTimeRequired_serviceStepId_fkey" FOREIGN KEY ("serviceStepId") REFERENCES "ServiceStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepAuthority" ADD CONSTRAINT "StepAuthority_responsibleStepId_fkey" FOREIGN KEY ("responsibleStepId") REFERENCES "ServiceStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepAuthority" ADD CONSTRAINT "StepAuthority_complaintStepId_fkey" FOREIGN KEY ("complaintStepId") REFERENCES "ServiceStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkingHours" ADD CONSTRAINT "WorkingHours_serviceStepId_fkey" FOREIGN KEY ("serviceStepId") REFERENCES "ServiceStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailedProc" ADD CONSTRAINT "DetailedProc_subServiceId_fkey" FOREIGN KEY ("subServiceId") REFERENCES "SubService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "OfficeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WardOffice" ADD CONSTRAINT "WardOffice_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WardOffice" ADD CONSTRAINT "WardOffice_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MunicipalityOffice" ADD CONSTRAINT "MunicipalityOffice_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MunicipalityOffice" ADD CONSTRAINT "MunicipalityOffice_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistrictOffice" ADD CONSTRAINT "DistrictOffice_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistrictOffice" ADD CONSTRAINT "DistrictOffice_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvinceOffice" ADD CONSTRAINT "ProvinceOffice_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvinceOffice" ADD CONSTRAINT "ProvinceOffice_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeRating" ADD CONSTRAINT "OfficeRating_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubServiceOnOffice" ADD CONSTRAINT "SubServiceOnOffice_subServiceId_fkey" FOREIGN KEY ("subServiceId") REFERENCES "SubService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubServiceOnOffice" ADD CONSTRAINT "SubServiceOnOffice_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;
