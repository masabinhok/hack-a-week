/**
 * Services Seeder (Updated for Self-Referential Model)
 * Seeds services from services.json with parent-child relationships
 * 
 * @module prisma/seeders/06-services.seed
 */
import { PrismaClient, Priority } from 'src/generated/prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface ServiceMetadata {
  version?: string;
  dataSource?: string;
  verifiedBy?: string;
  lastUpdated?: string;
}

interface ServiceData {
  serviceId: string;
  parentId: string | null;
  level: number;
  name: string;
  nameNepali?: string;
  slug: string;
  description?: string;
  descriptionNepali?: string;
  priority?: Priority;
  isOnlineEnabled?: boolean;
  onlinePortalUrl?: string;
  eligibility?: string;
  eligibilityNepali?: string;
  validityPeriod?: string;
  metadata?: ServiceMetadata;
}

function readJsonFile<T>(filename: string): T {
  const filePath = path.join(__dirname, '../data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function seedServices(prisma: PrismaClient): Promise<void> {
  console.log('📚 Seeding services (hierarchical)...\n');

  const services = readJsonFile<ServiceData[]>('services.json');
  
  // Create a map to store serviceId -> actual database id
  const serviceIdMap = new Map<string, string>();
  
  // Sort services by level to ensure parents are created before children
  const sortedServices = [...services].sort((a, b) => a.level - b.level);
  
  let created = 0;
  let updated = 0;

  for (const service of sortedServices) {
    // Resolve parent ID if exists
    let resolvedParentId: string | null = null;
    if (service.parentId) {
      resolvedParentId = serviceIdMap.get(service.parentId) || null;
      if (!resolvedParentId) {
        // Try to find parent by serviceId in database
        const parent = await prisma.service.findUnique({
          where: { serviceId: service.parentId },
          select: { id: true }
        });
        if (parent) {
          resolvedParentId = parent.id;
          serviceIdMap.set(service.parentId, parent.id);
        } else {
          console.warn(`  ⚠️  Parent service not found: ${service.parentId} for ${service.slug}`);
        }
      }
    }

    const { metadata, ...serviceData } = service;

    // First, try to find existing service
    const existing = await prisma.service.findUnique({
      where: { serviceId: service.serviceId },
      select: { id: true, createdAt: true }
    });

    let result;
    if (existing) {
      // Update existing service
      result = await prisma.service.update({
        where: { serviceId: service.serviceId },
        data: {
          parentId: resolvedParentId,
          level: serviceData.level,
          name: serviceData.name,
          slug: serviceData.slug,
          description: serviceData.description,
          priority: serviceData.priority,
          isOnlineEnabled: serviceData.isOnlineEnabled ?? false,
          onlinePortalUrl: serviceData.onlinePortalUrl,
          eligibility: serviceData.eligibility,
          validityPeriod: serviceData.validityPeriod,
        },
      });
      updated++;
    } else {
      // Create new service
      result = await prisma.service.create({
        data: {
          serviceId: serviceData.serviceId,
          parentId: resolvedParentId,
          level: serviceData.level,
          name: serviceData.name,
          slug: serviceData.slug,
          description: serviceData.description,
          priority: serviceData.priority,
          isOnlineEnabled: serviceData.isOnlineEnabled ?? false,
          onlinePortalUrl: serviceData.onlinePortalUrl,
          eligibility: serviceData.eligibility,
          validityPeriod: serviceData.validityPeriod,
          ...(metadata && {
            metadata: {
              create: {
                version: metadata.version,
                dataSource: metadata.dataSource,
                verifiedBy: metadata.verifiedBy,
                lastUpdated: metadata.lastUpdated ? new Date(metadata.lastUpdated) : new Date(),
              },
            },
          }),
        },
      });
      created++;
    }

    // Store mapping for children
    serviceIdMap.set(service.serviceId, result.id);
    
    // Progress indicator
    if ((created + updated) % 5 === 0) {
      console.log(`    Processed ${created + updated}/${services.length} services...`);
    }
  }

  console.log(`  ✅ Services: ${created} created, ${updated} updated (${services.length} total)\n`);
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
  
  seedServices(prisma)
    .then(() => prisma.$disconnect())
    .then(() => pool.end())
    .catch((e) => {
      console.error('❌ Seeding failed:', e);
      process.exit(1);
    });
}
