/**
 * Service Steps Seeder (Updated for Self-Referential Service Model)
 * Seeds service steps from service-steps-updated.json
 * Links steps directly to Service model via serviceSlug
 * 
 * @module prisma/seeders/08-service-steps.seed
 */
import { PrismaClient, OfficeType } from 'src/generated/prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface ServiceStepData {
  serviceSlug: string;
  step: number;
  stepTitle: string;
  stepTitleNepali?: string;
  stepDescription: string;
  stepDescriptionNepali?: string;
  officeTypes: OfficeType[];
  requiresAppointment: boolean;
}

function readJsonFile<T>(filename: string): T {
  const filePath = path.join(__dirname, '../data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function seedServiceSteps(prisma: PrismaClient): Promise<void> {
  console.log('📝 Seeding service steps...\n');

  const steps = readJsonFile<ServiceStepData[]>('service-steps.json');
  
  // Build a cache of service slugs to IDs
  const serviceCache = new Map<string, string>();
  
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const step of steps) {
    // Get service ID from cache or database
    let serviceId = serviceCache.get(step.serviceSlug);
    
    if (!serviceId) {
      const service = await prisma.service.findFirst({
        where: { slug: step.serviceSlug },
        select: { id: true }
      });
      
      if (!service) {
        console.warn(`  ⚠️  Service not found: ${step.serviceSlug}`);
        skipped++;
        continue;
      }
      
      serviceId = service.id;
      serviceCache.set(step.serviceSlug, serviceId);
    }

    // Check if step already exists
    const existingStep = await prisma.serviceStep.findUnique({
      where: {
        serviceId_step: {
          serviceId: serviceId,
          step: step.step,
        }
      }
    });

    const stepData = {
      stepTitle: step.stepTitle,
      stepDescription: step.stepDescription,
      officeTypes: step.officeTypes,
      requiresAppointment: step.requiresAppointment,
    };

    if (existingStep) {
      await prisma.serviceStep.update({
        where: { id: existingStep.id },
        data: stepData,
      });
      updated++;
    } else {
      await prisma.serviceStep.create({
        data: {
          ...stepData,
          serviceId: serviceId,
          step: step.step,
        },
      });
      created++;
    }
  }

  console.log(`  ✅ Service Steps: ${created} created, ${updated} updated, ${skipped} skipped (${steps.length} total)\n`);
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
  
  seedServiceSteps(prisma)
    .then(() => prisma.$disconnect())
    .then(() => pool.end())
    .catch((e) => {
      console.error('❌ Seeding failed:', e);
      process.exit(1);
    });
}
