/**
 * Service Categories Seeder
 * Links services to categories via junction table
 * 
 * @module prisma/seeders/07-service-categories.seed
 */
import { PrismaClient } from 'src/generated/prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface ServiceCategoryLink {
  serviceSlug: string;
  categorySlug: string;
}

function readJsonFile<T>(filename: string): T {
  const filePath = path.join(__dirname, '../data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function seedServiceCategories(prisma: PrismaClient): Promise<void> {
  console.log('🔗 Seeding service-category links...\n');

  const links = readJsonFile<ServiceCategoryLink[]>('service-categories.json');
  let created = 0;
  let skipped = 0;

  for (const link of links) {
    // Find service by slug
    const service = await prisma.service.findFirst({
      where: { slug: link.serviceSlug },
      select: { id: true }
    });

    if (!service) {
      console.warn(`  ⚠️  Service not found: ${link.serviceSlug}`);
      skipped++;
      continue;
    }

    // Find category by slug
    const category = await prisma.category.findUnique({
      where: { slug: link.categorySlug },
      select: { id: true }
    });

    if (!category) {
      console.warn(`  ⚠️  Category not found: ${link.categorySlug}`);
      skipped++;
      continue;
    }

    // Check if link already exists
    const existingLink = await prisma.serviceCategory.findUnique({
      where: {
        serviceId_categoryId: {
          serviceId: service.id,
          categoryId: category.id,
        }
      }
    });

    if (!existingLink) {
      await prisma.serviceCategory.create({
        data: {
          serviceId: service.id,
          categoryId: category.id,
        }
      });
      created++;
    }
  }

  console.log(`  ✅ Service-Category links: ${created} created, ${skipped} skipped (${links.length} total)\n`);
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
  
  seedServiceCategories(prisma)
    .then(() => prisma.$disconnect())
    .then(() => pool.end())
    .catch((e) => {
      console.error('❌ Seeding failed:', e);
      process.exit(1);
    });
}
