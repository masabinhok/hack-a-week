/**
 * Migration Script: OfficeType to OfficeCategory
 * 
 * This script migrates all usages of OfficeType enum to OfficeCategory:
 * 1. Updates OfficeCategory table to have slugs matching the old OfficeType values
 * 2. Migrates Office.type to use Office.categoryId
 * 3. Migrates ServiceStep.officeTypes to ServiceStep.officeCategoryIds
 * 
 * Run this script AFTER running prisma migrate to create the new schema.
 * 
 * Usage:
 *   npx ts-node -r tsconfig-paths/register prisma/migrations/migrate-office-type-to-category.ts
 */

import { PrismaClient } from '../../src/generated/prisma/client';

// Map of old OfficeType values to descriptions
const OFFICE_TYPE_CONFIG: Record<string, { description: string; slug: string }> = {
  DISTRICT_ADMINISTRATION_OFFICE: { 
    slug: 'district-administration-office',
    description: 'District Administration Office (DAO) - Citizenship, recommendations, certificates' 
  },
  LAND_REVENUE_OFFICE: { 
    slug: 'land-revenue-office',
    description: 'Land Revenue Office (Malpot) - Land registration, ownership transfer' 
  },
  DISTRICT_EDUCATION_OFFICE: { 
    slug: 'district-education-office',
    description: 'District Education Office - SEE/SLC verification, certificate attestation' 
  },
  TRANSPORT_MANAGEMENT_OFFICE: { 
    slug: 'transport-management-office',
    description: 'Transport Management Office - Vehicle registration, blue book, license' 
  },
  DRIVING_LICENSE_OFFICE: { 
    slug: 'driving-license-office',
    description: 'Driving License Office - License tests and renewals' 
  },
  MUNICIPALITY_OFFICE: { 
    slug: 'municipality-office',
    description: 'Municipality Office (Nagarpalika) - Local services, business tax' 
  },
  RURAL_MUNICIPALITY_OFFICE: { 
    slug: 'rural-municipality-office',
    description: 'Rural Municipality Office (Gaupalika) - Rural local services' 
  },
  WARD_OFFICE: { 
    slug: 'ward-office',
    description: 'Ward Office - Birth/death registration, business registration, recommendations' 
  },
  PASSPORT_OFFICE: { 
    slug: 'passport-office',
    description: 'Passport Office - Passport applications and renewals' 
  },
  IMMIGRATION_OFFICE: { 
    slug: 'immigration-office',
    description: 'Immigration Office - Visa, travel documents' 
  },
  OFFICE_OF_COMPANY_REGISTRAR: { 
    slug: 'office-of-company-registrar',
    description: 'Office of Company Registrar (OCR) - Company registration (e-OCR/CAMIS)' 
  },
  COTTAGE_SMALL_INDUSTRY_OFFICE: { 
    slug: 'cottage-small-industry-office',
    description: 'Cottage & Small Industry Office (DCSI) - Cottage/small industry registration' 
  },
  INLAND_REVENUE_OFFICE: { 
    slug: 'inland-revenue-office',
    description: 'Inland Revenue Office (IRD) - PAN/VAT registration, tax filing' 
  },
  LABOUR_OFFICE: { 
    slug: 'labour-office',
    description: 'Labour Office - Foreign employment, work permits, labor disputes' 
  },
};

async function migrate() {
  console.log('🔄 Starting OfficeType to OfficeCategory migration...\n');

  // Initialize Prisma client with adapter
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
  const prisma = new PrismaClient({ adapter } as any);

  try {
    // Step 1: Update OfficeCategory with slugs
    console.log('📋 Step 1: Updating OfficeCategory slugs...');
    
    for (const [name, config] of Object.entries(OFFICE_TYPE_CONFIG)) {
      await prisma.officeCategory.upsert({
        where: { name },
        update: { 
          slug: config.slug,
          description: config.description,
        },
        create: {
          name,
          slug: config.slug,
          description: config.description,
        },
      });
    }
    console.log('  ✅ OfficeCategory slugs updated\n');

    // Step 2: Build category lookup map
    console.log('📋 Step 2: Building category lookup map...');
    const categories = await prisma.officeCategory.findMany();
    const categoryByName = new Map(categories.map(c => [c.name, c.id]));
    const categoryBySlug = new Map(categories.map(c => [c.slug, c.id]));
    console.log(`  Found ${categories.length} categories\n`);

    // Step 3: Migrate Office.type to categoryId
    console.log('📋 Step 3: Migrating Office data...');
    
    // Check if 'type' column exists using raw query
    const officeTypeCheck = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Office' AND column_name = 'type'
    `;

    if (officeTypeCheck.length > 0) {
      // Get offices with their type values
      const officesWithType = await prisma.$queryRaw<{ id: string; type: string; categoryId: string }[]>`
        SELECT id, type::text, "categoryId" FROM "Office"
      `;

      let officeUpdates = 0;
      for (const office of officesWithType) {
        const categoryId = categoryByName.get(office.type);
        if (categoryId && office.categoryId !== categoryId) {
          await prisma.office.update({
            where: { id: office.id },
            data: { categoryId },
          });
          officeUpdates++;
        }
      }
      console.log(`  ✅ Updated ${officeUpdates} offices\n`);
    } else {
      console.log('  ℹ️  Office.type column not found (already migrated)\n');
    }

    // Step 4: Migrate ServiceStep.officeTypes to officeCategoryIds
    console.log('📋 Step 4: Migrating ServiceStep data...');
    
    // Check if 'officeTypes' column exists
    const stepTypeCheck = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'ServiceStep' AND column_name = 'officeTypes'
    `;

    if (stepTypeCheck.length > 0) {
      // Get service steps with their officeTypes
      const stepsWithTypes = await prisma.$queryRaw<{ id: string; officeTypes: string[] }[]>`
        SELECT id, "officeTypes"::text[] as "officeTypes" FROM "ServiceStep"
      `;

      let stepUpdates = 0;
      for (const step of stepsWithTypes) {
        if (step.officeTypes && step.officeTypes.length > 0) {
          const categoryIds = step.officeTypes
            .map(type => categoryByName.get(type))
            .filter((id): id is string => id !== undefined);
          
          if (categoryIds.length > 0) {
            await prisma.serviceStep.update({
              where: { id: step.id },
              data: { officeCategoryIds: categoryIds },
            });
            stepUpdates++;
          }
        }
      }
      console.log(`  ✅ Updated ${stepUpdates} service steps\n`);
    } else {
      console.log('  ℹ️  ServiceStep.officeTypes column not found (already migrated)\n');
    }

    console.log('✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Run "npx prisma migrate dev" to apply schema changes');
    console.log('  2. The migration will drop the OfficeType enum and related columns');
    console.log('  3. Regenerate Prisma client with "npx prisma generate"');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

migrate().catch(console.error);
