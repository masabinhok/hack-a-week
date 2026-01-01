// Seeder for service steps
import { PrismaClient } from 'src/generated/prisma/client';


import * as fs from 'fs';
import * as path from 'path';

function readJsonFile<T>(filename: string): T {
  const filePath = path.join(__dirname, '../data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function seedServiceSteps(prisma: PrismaClient) {
  console.log('📝 Seeding service steps...\n');

  const steps = readJsonFile<any[]>('service-steps.json');
  let created = 0;

  for (const step of steps) {
    const subService = await prisma.subService.findUnique({
      where: { slug: step.subServiceSlug },
    });

    if (!subService) {
      console.log(`  ⚠️  SubService not found: ${step.subServiceSlug}`);
      continue;
    }

    const { subServiceSlug, ...stepData } = step;

    // Check if step already exists (by subServiceId + step number)
    const existing = await prisma.serviceStep.findFirst({
      where: {
        subServiceId: subService.id,
        step: stepData.step,
      },
    });

    if (!existing) {
      await prisma.serviceStep.create({
        data: {
          ...stepData,
          subServiceId: subService.id,
        },
      });
      created++;
    }
  }

  console.log(`  ✓ Created ${created} service step(s)\n`);
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
  seedServiceSteps(prisma).then(() => prisma.$disconnect());
}
