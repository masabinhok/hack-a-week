
import { seedLocations } from './seeders/01-locations.seed';
import { seedOfficeCategories } from './seeders/02-office-categories.seed';
import { seedOffices } from './seeders/03-offices.seed';
import { seedOfficeLocations } from './seeders/04-office-locations.seed';
import { seedServices } from './seeders/05-services.seed';
import { seedSubServices } from './seeders/06-sub-services.seed';
import { seedServiceSteps } from './seeders/07-service-steps.seed';
import { seedStepDetails } from './seeders/08-step-details.seed';
import { seedDetailedProc } from './seeders/09-detailed-proc.seed';
import { seedServiceOffices } from './seeders/10-service-offices.seed';

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
    console.log('🚀 Prisma Modular Seeding Started');
    await seedLocations(prisma);
    // we can add more seeders here as they are implemented
    await seedOfficeCategories(prisma);    // 2. Office categories
    await seedOffices(prisma);             // 3. Offices
    await seedOfficeLocations(prisma);     // 4. Link offices to locations
    await seedServices(prisma);            // 5. Services
    await seedSubServices(prisma);         // 6. Sub-services
    await seedServiceSteps(prisma);        // 7. Steps
    await seedStepDetails(prisma);         // 8. Step details (docs, fees, etc.)
    await seedDetailedProc(prisma);        // 9. Detailed procedures
    await seedServiceOffices(prisma);      // 10. Link services to offices
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
