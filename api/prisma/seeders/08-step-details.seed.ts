// Seeder for step details (documents, fees, time, authorities, working hours)
import { PrismaClient } from 'src/generated/prisma/client';


import * as fs from 'fs';
import * as path from 'path';

function readJsonFile<T>(filename: string): T {
  const filePath = path.join(__dirname, '../data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function seedStepDetails(prisma: PrismaClient) {
  console.log('📄 Seeding step details...\n');

  // Get all service steps for lookup
  const subService = await prisma.subService.findUnique({
    where: { slug: 'new-citizenship-certificate' },
    include: { serviceSteps: true },
  });

  if (!subService) {
    console.log('  ⚠️  SubService not found');
    return;
  }

  // 1. Seed Documents
  console.log('  → Documents...');
  const documents = readJsonFile<any[]>('step-documents.json');

  for (const doc of documents) {
    const step = subService.serviceSteps.find((s) => s.step === doc.stepNumber);
    if (!step) continue;

    const { stepNumber, subServiceSlug, ...docData } = doc;

    // Use upsert to avoid duplicate key errors
    await prisma.stepDocument.upsert({
      where: {
        serviceStepId_docId: {
          serviceStepId: step.id,
          docId: doc.docId,
        },
      },
      update: docData,
      create: {
        ...docData,
        serviceStepId: step.id,
      },
    });
  }

  // 2. Seed Fees
  console.log('  → Fees...');
  const fees = readJsonFile<any[]>('step-fees.json');

  for (const fee of fees) {
    const step = subService.serviceSteps.find((s) => s.step === fee.stepNumber);
    if (!step) continue;

    const { stepNumber, subServiceSlug, ...feeData } = fee;

    // Use upsert to avoid duplicate key errors
    await prisma.stepFee.upsert({
      where: {
        serviceStepId_feeId: {
          serviceStepId: step.id,
          feeId: fee.feeId,
        },
      },
      update: feeData,
      create: {
        ...feeData,
        serviceStepId: step.id,
      },
    });
  }

  // 3. Seed Time Requirements
  console.log('  → Time requirements...');
  const times = readJsonFile<any[]>('step-time.json');

  for (const time of times) {
    const step = subService.serviceSteps.find((s) => s.step === time.stepNumber);
    if (!step) continue;

    const { stepNumber, subServiceSlug, ...timeData } = time;

    // Use upsert to avoid duplicate key errors
    await prisma.stepTimeRequired.upsert({
      where: {
        serviceStepId: step.id,
      },
      update: timeData,
      create: {
        ...timeData,
        serviceStepId: step.id,
      },
    });
  }

  // 4. Seed Authorities
  console.log('  → Authorities...');
  const authorities = readJsonFile<any[]>('step-authorities.json');

  for (const auth of authorities) {
    const step = subService.serviceSteps.find((s) => s.step === auth.stepNumber);
    if (!step) continue;

    const { stepNumber, subServiceSlug, isResponsible, ...authData } = auth;

    // Check if authority already exists to avoid duplicates
    const existingAuth = await prisma.stepAuthority.findFirst({
      where: {
        position: authData.position,
        department: authData.department,
        isResp: isResponsible,
        ...(isResponsible 
          ? { responsibleStepId: step.id }
          : { complaintStepId: step.id }
        ),
      },
    });

    if (!existingAuth) {
      await prisma.stepAuthority.create({
        data: {
          ...authData,
          isResp: isResponsible,
          responsibleStepId: isResponsible ? step.id : null,
          complaintStepId: !isResponsible ? step.id : null,
        },
      });
    }
  }

  // 5. Seed Working Hours
  console.log('  → Working hours...');
  const hours = readJsonFile<any[]>('working-hours.json');

  for (const hour of hours) {
    const step = subService.serviceSteps.find((s) => s.step === hour.stepNumber);
    if (!step) continue;

    const { stepNumber, subServiceSlug, ...hourData } = hour;

    // Use upsert with unique constraint on [serviceStepId, day]
    await prisma.workingHours.upsert({
      where: {
        serviceStepId_day: {
          serviceStepId: step.id,
          day: hourData.day,
        },
      },
      update: hourData,
      create: {
        ...hourData,
        serviceStepId: step.id,
      },
    });
  }

  console.log('  ✓ Step details seeded\n');
}


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
  seedStepDetails(prisma).then(() => prisma.$disconnect());
}
