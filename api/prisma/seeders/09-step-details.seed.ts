/**
 * Step Details Seeder (Updated for Self-Referential Service Model)
 * Seeds documents, fees, time requirements, authorities, and working hours
 * Uses serviceSlug instead of subServiceSlug
 * 
 * @module prisma/seeders/09-step-details.seed
 */
import { PrismaClient, DocType, Currency, FeeType, WeekDay } from 'src/generated/prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface StepDocumentData {
  stepNumber: number;
  serviceSlug: string;
  docId: string;
  name: string;
  nameNepali: string;
  type: DocType;
  quantity: number;
  format: string;
  isMandatory: boolean;
  notes?: string;
  relatedService?: string;
  alternativeDocuments: string[];
}

interface StepFeeData {
  stepNumber: number;
  serviceSlug: string;
  feeId: string;
  feeTitle: string;
  feeTitleNepali?: string;
  feeAmount: number;
  currency: Currency;
  feeType: FeeType;
  isRefundable: boolean;
  applicableCondition?: string;
  notes?: string;
}

interface StepTimeData {
  stepNumber: number;
  serviceSlug: string;
  minimumTime: string;
  maximumTime: string;
  averageTime: string;
  remarks?: string;
  expeditedAvailable: boolean;
  workingDaysOnly: boolean;
}

interface StepAuthorityData {
  stepNumber: number;
  serviceSlug: string;
  isResponsible: boolean;
  position: string;
  positionNepali?: string;
  department: string;
  departmentNepali?: string;
  contactNumber: string;
  email?: string;
  complaintProcess?: string;
}

interface WorkingHoursData {
  serviceSlug: string;
  day: WeekDay;
  openClose: string;
}

function readJsonFile<T>(filename: string): T {
  const filePath = path.join(__dirname, '../data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Helper to get service step ID by service slug and step number
 */
async function getServiceStepId(
  prisma: PrismaClient,
  serviceSlug: string,
  stepNumber: number,
  stepCache: Map<string, Map<number, string>>
): Promise<string | null> {
  // Check cache first
  const serviceSteps = stepCache.get(serviceSlug);
  if (serviceSteps?.has(stepNumber)) {
    return serviceSteps.get(stepNumber)!;
  }

  // Find service first
  const service = await prisma.service.findFirst({
    where: { slug: serviceSlug },
    select: { id: true }
  });

  if (!service) return null;

  // Find step
  const step = await prisma.serviceStep.findUnique({
    where: {
      serviceId_step: {
        serviceId: service.id,
        step: stepNumber,
      }
    },
    select: { id: true }
  });

  if (!step) return null;

  // Cache result
  if (!stepCache.has(serviceSlug)) {
    stepCache.set(serviceSlug, new Map());
  }
  stepCache.get(serviceSlug)!.set(stepNumber, step.id);

  return step.id;
}

export async function seedStepDetails(prisma: PrismaClient): Promise<void> {
  console.log('📄 Seeding step details...\n');

  // Cache for service step lookups
  const stepCache = new Map<string, Map<number, string>>();

  // 1. Seed Documents
  console.log('  → Documents...');
  const documents = readJsonFile<StepDocumentData[]>('step-documents.json');
  let docCount = 0;

  for (const doc of documents) {
    const stepId = await getServiceStepId(prisma, doc.serviceSlug, doc.stepNumber, stepCache);
    if (!stepId) {
      console.warn(`    ⚠️ Step not found: ${doc.serviceSlug} step ${doc.stepNumber}`);
      continue;
    }

    await prisma.stepDocument.upsert({
      where: {
        serviceStepId_docId: {
          serviceStepId: stepId,
          docId: doc.docId,
        }
      },
      update: {
        name: doc.name,
        nameNepali: doc.nameNepali,
        type: doc.type,
        quantity: doc.quantity,
        format: doc.format,
        isMandatory: doc.isMandatory,
        notes: doc.notes,
        relatedService: doc.relatedService,
        alternativeDocuments: doc.alternativeDocuments,
      },
      create: {
        serviceStepId: stepId,
        docId: doc.docId,
        name: doc.name,
        nameNepali: doc.nameNepali,
        type: doc.type,
        quantity: doc.quantity,
        format: doc.format,
        isMandatory: doc.isMandatory,
        notes: doc.notes,
        relatedService: doc.relatedService,
        alternativeDocuments: doc.alternativeDocuments,
      },
    });
    docCount++;
  }
  console.log(`    ✓ ${docCount} documents seeded`);

  // 2. Seed Fees
  console.log('  → Fees...');
  const fees = readJsonFile<StepFeeData[]>('step-fees.json');
  let feeCount = 0;

  for (const fee of fees) {
    const stepId = await getServiceStepId(prisma, fee.serviceSlug, fee.stepNumber, stepCache);
    if (!stepId) continue;

    await prisma.stepFee.upsert({
      where: {
        serviceStepId_feeId: {
          serviceStepId: stepId,
          feeId: fee.feeId,
        }
      },
      update: {
        feeTitle: fee.feeTitle,
        feeTitleNepali: fee.feeTitleNepali,
        feeAmount: fee.feeAmount,
        currency: fee.currency,
        feeType: fee.feeType,
        isRefundable: fee.isRefundable,
        applicableCondition: fee.applicableCondition,
        notes: fee.notes,
      },
      create: {
        serviceStepId: stepId,
        feeId: fee.feeId,
        feeTitle: fee.feeTitle,
        feeTitleNepali: fee.feeTitleNepali,
        feeAmount: fee.feeAmount,
        currency: fee.currency,
        feeType: fee.feeType,
        isRefundable: fee.isRefundable,
        applicableCondition: fee.applicableCondition,
        notes: fee.notes,
      },
    });
    feeCount++;
  }
  console.log(`    ✓ ${feeCount} fees seeded`);

  // 3. Seed Time Requirements
  console.log('  → Time requirements...');
  const times = readJsonFile<StepTimeData[]>('step-time.json');
  let timeCount = 0;

  for (const time of times) {
    const stepId = await getServiceStepId(prisma, time.serviceSlug, time.stepNumber, stepCache);
    if (!stepId) continue;

    await prisma.stepTimeRequired.upsert({
      where: { serviceStepId: stepId },
      update: {
        minimumTime: time.minimumTime,
        maximumTime: time.maximumTime,
        averageTime: time.averageTime,
        remarks: time.remarks,
        expeditedAvailable: time.expeditedAvailable,
        workingDaysOnly: time.workingDaysOnly,
      },
      create: {
        serviceStepId: stepId,
        minimumTime: time.minimumTime,
        maximumTime: time.maximumTime,
        averageTime: time.averageTime,
        remarks: time.remarks,
        expeditedAvailable: time.expeditedAvailable,
        workingDaysOnly: time.workingDaysOnly,
      },
    });
    timeCount++;
  }
  console.log(`    ✓ ${timeCount} time requirements seeded`);

  // 4. Seed Authorities
  console.log('  → Authorities...');
  const authorities = readJsonFile<StepAuthorityData[]>('step-authorities.json');
  let authCount = 0;

  for (const auth of authorities) {
    const stepId = await getServiceStepId(prisma, auth.serviceSlug, auth.stepNumber, stepCache);
    if (!stepId) continue;

    // Check if authority already exists to avoid duplicates
    const existing = await prisma.stepAuthority.findFirst({
      where: {
        position: auth.position,
        department: auth.department,
        isResp: auth.isResponsible,
        ...(auth.isResponsible 
          ? { responsibleStepId: stepId }
          : { complaintStepId: stepId }
        ),
      },
    });

    if (!existing) {
      await prisma.stepAuthority.create({
        data: {
          position: auth.position,
          positionNepali: auth.positionNepali,
          department: auth.department,
          contactNumber: auth.contactNumber,
          email: auth.email,
          complaintProcess: auth.complaintProcess,
          isResp: auth.isResponsible,
          responsibleStepId: auth.isResponsible ? stepId : null,
          complaintStepId: !auth.isResponsible ? stepId : null,
        },
      });
      authCount++;
    }
  }
  console.log(`    ✓ ${authCount} authorities seeded`);

  // 5. Seed Working Hours (per service, applied to first step)
  console.log('  → Working hours...');
  const hours = readJsonFile<WorkingHoursData[]>('working-hours.json');
  let hourCount = 0;

  for (const hour of hours) {
    // Get the first step of the service for working hours
    const stepId = await getServiceStepId(prisma, hour.serviceSlug, 1, stepCache);
    if (!stepId) continue;

    await prisma.workingHours.upsert({
      where: {
        serviceStepId_day: {
          serviceStepId: stepId,
          day: hour.day,
        }
      },
      update: {
        openClose: hour.openClose,
      },
      create: {
        serviceStepId: stepId,
        day: hour.day,
        openClose: hour.openClose,
      },
    });
    hourCount++;
  }
  console.log(`    ✓ ${hourCount} working hours seeded`);

  console.log('\n  ✅ Step details seeding complete\n');
}

// Allow standalone execution
if (require.main === module) {
  const { PrismaPg } = require('@prisma/adapter-pg');
  const pg = require('pg');
  
  const dbUrl = String(process.env.DATABASE_URL || '').trim();
  let finalConnectionUrl: string;
  
  try {
    const urlObj = new URL(dbUrl);
    if (!urlObj.password) throw new Error('Password missing in DATABASE_URL');
    urlObj.password = encodeURIComponent(urlObj.password);
    finalConnectionUrl = urlObj.href;
  } catch (e) {
    console.error('❌ Could not parse DATABASE_URL as valid URL:', e);
    process.exit(1);
  }
  
  const pool = new pg.Pool({ connectionString: finalConnectionUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  seedStepDetails(prisma)
    .then(() => prisma.$disconnect())
    .then(() => pool.end())
    .catch((e) => {
      console.error('❌ Seeding failed:', e);
      process.exit(1);
    });
}
