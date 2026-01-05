/**
 * Service Steps Seeder (Updated for Self-Referential Service Model)
 * Seeds service steps from service-steps.json
 * Links steps directly to Service model via serviceSlug
 * Maps officeCategoryNames to officeCategoryIds
 * 
 * @module prisma/seeders/08-service-steps.seed
 */
import { PrismaClient, LocationType } from 'src/generated/prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface ServiceStepData {
  serviceSlug: string;
  step: number;
  stepTitle: string;
  stepTitleNepali?: string;
  stepDescription: string;
  stepDescriptionNepali?: string;
  officeCategoryNames: string[]; // Category names like "WARD_OFFICE", "DISTRICT_ADMINISTRATION_OFFICE"
  locationType?: LocationType;
  requiresAppointment: boolean;
  isOnline?: boolean;
  onlineFormUrl?: string;
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
  
  // Build a cache of category names to IDs
  const categories = await prisma.officeCategory.findMany();
  const categoryNameToIdCache = new Map(categories.map(c => [c.name, c.id]));
  
  // Log available categories for debugging
  console.log(`  📋 Available office categories: ${Array.from(categoryNameToIdCache.keys()).join(', ')}\n`);
  
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const invalidCategories: string[] = [];

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

    // Map category names to IDs and validate
    const officeCategoryIds: string[] = [];
    for (const name of (step.officeCategoryNames || [])) {
      const categoryId = categoryNameToIdCache.get(name);
      if (categoryId) {
        officeCategoryIds.push(categoryId);
      } else if (name && !invalidCategories.includes(name)) {
        invalidCategories.push(name);
        console.warn(`  ⚠️  Invalid office category name: "${name}" in step ${step.step} of ${step.serviceSlug}`);
      }
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
      officeCategoryIds,
      locationType: step.locationType || 'CONVENIENT',
      requiresAppointment: step.requiresAppointment,
      isOnline: step.isOnline || false,
      onlineFormUrl: step.onlineFormUrl || null,
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

  if (invalidCategories.length > 0) {
    console.log(`  ⚠️  Found ${invalidCategories.length} invalid category names: ${invalidCategories.join(', ')}`);
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
