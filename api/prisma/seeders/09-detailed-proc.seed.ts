// Seeder for detailed procedures
import { PrismaClient } from 'src/generated/prisma/client';

import * as fs from 'fs';
import * as path from 'path';

function readJsonFile<T>(filename: string): T {
  const filePath = path.join(__dirname, '../data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function seedDetailedProc(prisma: PrismaClient) {
  console.log('📖 Seeding detailed procedures...\n');

  const procs = readJsonFile<any[]>('detailed-proc.json');

  for (const proc of procs) {
    const subService = await prisma.subService.findUnique({
      where: { slug: proc.subServiceSlug },
    });

    if (!subService) {
      console.log(`  ⚠️  SubService not found: ${proc.subServiceSlug}`);
      continue;
    }

    const { subServiceSlug, ...procData } = proc;

    await prisma.detailedProc.upsert({
      where: { subServiceId: subService.id },
      update: procData,
      create: {
        ...procData,
        subServiceId: subService.id,
      },
    });
  }

  console.log(`  ✓ Created ${procs.length} detailed procedure(s)\n`);
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
  seedDetailedProc(prisma).then(() => prisma.$disconnect());
}
