import { PrismaClient } from 'src/generated/prisma/client';
import * as fs from 'fs';
import * as path from 'path';

function readJsonFile<T>(filename: string): T {
  const filePath = path.join(__dirname, '../data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function seedServices(prisma: PrismaClient) {
  console.log('📚 Seeding services...\n');

  const services = readJsonFile<any[]>('services.json');

  for (const service of services) {
    const { metadata, ...serviceData } = service;

    await prisma.service.upsert({
      where: { serviceId: service.serviceId },
      update: serviceData,
      create: {
        ...serviceData,
        metadata: metadata
          ? {
              create: metadata,
            }
          : undefined,
      },
    });
  }

  console.log(`  ✓ Created ${services.length} service(s)\n`);
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
  seedServices(prisma).then(() => prisma.$disconnect());
}
