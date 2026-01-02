
import { seedLocations } from './seeders/01-locations.seed';
import { seedOfficeCategories } from './seeders/02-office-categories.seed';
import { seedOffices } from './seeders/03-offices.seed';
import { seedOfficeLocations } from './seeders/04-office-locations.seed';
import { seedCategories } from './seeders/05-categories.seed';
import { seedServices } from './seeders/06-services.seed';
import { seedServiceCategories } from './seeders/07-service-categories.seed';
import { seedServiceSteps } from './seeders/08-service-steps.seed';
import { seedStepDetails } from './seeders/09-step-details.seed';
import { seedDetailedProc } from './seeders/10-detailed-proc.seed';

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
const pg = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const pool = new pg.Pool({ connectionString: finalConnectionUrl });
const adapter = new PrismaPg(pool);
const prisma = new (require('src/generated/prisma/client').PrismaClient)({ adapter });

async function main() {
  try {
    console.log('🚀 Prisma Modular Seeding Started\n');
    
    // Phase 1: Locations & Offices
    await seedLocations(prisma);
    await seedOfficeCategories(prisma);
    await seedOffices(prisma);
    await seedOfficeLocations(prisma);
    
    // Phase 2: Categories & Services
    await seedCategories(prisma);
    await seedServices(prisma);
    await seedServiceCategories(prisma);
    
    // Phase 3: Service Steps & Details
    await seedServiceSteps(prisma);
    await seedStepDetails(prisma);
    await seedDetailedProc(prisma);
    
    console.log('✅ All seeders completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

if (require.main === module) {
  main();
}
