// Seeder for sub-services
import { PrismaClient } from 'src/generated/prisma/client';

import * as fs from 'fs';
import * as path from 'path';

function readJsonFile<T>(filename: string): T {
  const filePath = path.join(__dirname, '../data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function seedSubServices(prisma: PrismaClient) {
  console.log('📋 Seeding sub-services...\n');

  const subServices = readJsonFile<any[]>('sub-services.json');
  let created = 0;
  
  for (const subService of subServices) {
    // Find the Service by its serviceId field (e.g., "SRV-001")
    const service = await prisma.service.findUnique({ 
      where: { serviceId: subService.serviceId } 
    });
    
    if (!service) {
      console.warn(`  ⚠️  Service not found: ${subService.serviceId} for sub-service: ${subService.slug}`);
      continue;
    }

    // Replace the human-readable serviceId with the actual Service.id (cuid)
    const { serviceId: _serviceId, ...subServiceData } = subService;
    
    await prisma.subService.upsert({
      where: { slug: subService.slug },
      update: {
        ...subServiceData,
        serviceId: service.id, // Use the cuid from the Service table
      },
      create: {
        ...subServiceData,
        serviceId: service.id, // Use the cuid from the Service table
      },
    });
    created++;
  }

  console.log(`  ✓ Created ${created} sub-service(s)\n`);
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
  seedSubServices(prisma).then(() => prisma.$disconnect());
}
