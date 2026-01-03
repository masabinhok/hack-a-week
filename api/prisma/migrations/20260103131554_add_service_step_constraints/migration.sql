-- CreateTable
CREATE TABLE "ServiceStepConstraint" (
    "id" TEXT NOT NULL,
    "serviceStepId" TEXT NOT NULL,
    "specificOfficeIds" TEXT[],
    "provinceIds" INTEGER[],
    "districtIds" INTEGER[],
    "municipalityIds" INTEGER[],
    "reason" TEXT,
    "isException" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceStepConstraint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceStepConstraint_serviceStepId_idx" ON "ServiceStepConstraint"("serviceStepId");

-- AddForeignKey
ALTER TABLE "ServiceStepConstraint" ADD CONSTRAINT "ServiceStepConstraint_serviceStepId_fkey" FOREIGN KEY ("serviceStepId") REFERENCES "ServiceStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
