-- CreateEnum
CREATE TYPE "OfficeServiceStatus" AS ENUM ('CLAIMED', 'PENDING', 'REVOKED');

-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "OfficeService" (
    "id" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "status" "OfficeServiceStatus" NOT NULL DEFAULT 'CLAIMED',
    "customDescription" TEXT,
    "customFees" JSONB,
    "customRequirements" TEXT[],
    "notes" TEXT,
    "claimedBy" TEXT,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "revokedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficeService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "officeId" TEXT,
    "serviceName" TEXT NOT NULL,
    "serviceDescription" TEXT,
    "categoryId" TEXT,
    "priority" "Priority",
    "justification" TEXT,
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "rejectionReason" TEXT,
    "approvedServiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfficeService_officeId_idx" ON "OfficeService"("officeId");

-- CreateIndex
CREATE INDEX "OfficeService_serviceId_idx" ON "OfficeService"("serviceId");

-- CreateIndex
CREATE INDEX "OfficeService_status_idx" ON "OfficeService"("status");

-- CreateIndex
CREATE UNIQUE INDEX "OfficeService_officeId_serviceId_key" ON "OfficeService"("officeId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_approvedServiceId_key" ON "ServiceRequest"("approvedServiceId");

-- CreateIndex
CREATE INDEX "ServiceRequest_requestedBy_idx" ON "ServiceRequest"("requestedBy");

-- CreateIndex
CREATE INDEX "ServiceRequest_officeId_idx" ON "ServiceRequest"("officeId");

-- CreateIndex
CREATE INDEX "ServiceRequest_status_idx" ON "ServiceRequest"("status");

-- CreateIndex
CREATE INDEX "ServiceRequest_reviewedBy_idx" ON "ServiceRequest"("reviewedBy");

-- AddForeignKey
ALTER TABLE "OfficeService" ADD CONSTRAINT "OfficeService_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeService" ADD CONSTRAINT "OfficeService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_approvedServiceId_fkey" FOREIGN KEY ("approvedServiceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
