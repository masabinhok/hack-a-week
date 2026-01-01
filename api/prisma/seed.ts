
import { seedLocations } from './seeders/01-locations.seed';

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
