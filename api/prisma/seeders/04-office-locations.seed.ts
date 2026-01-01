
import { PrismaClient, OfficeType } from 'src/generated/prisma/client';

export async function seedOfficeLocations(prisma: PrismaClient) {
  console.log('🏢 Seeding office-location links...\n');

  // 1. Link DAOs to Districts
  const daos = await prisma.office.findMany({
    where: { type: 'DISTRICT_ADMINISTRATION_OFFICE' },
  });
  let districtLinks = 0;
  for (const dao of daos) {
    // DAO officeId format: DAO-XXX (XXX = district id)
    const districtId = parseInt(dao.officeId.replace('DAO-', ''));
    if (!isNaN(districtId)) {
      await prisma.districtOffice.upsert({
        where: { officeId: dao.id },
        update: {},
        create: {
          officeId: dao.id,
          districtId,
        },
      });
      districtLinks++;
    }
  }
  console.log(`  ✓ Linked ${districtLinks} DAOs to districts.`);

  // 2. Link Ward Offices to Wards
  const wardOffices = await prisma.office.findMany({
    where: { type: 'WARD_OFFICE' },
  });
  let wardLinks = 0;
  for (const office of wardOffices) {
    // WARD-XXXXX (XXXXX = ward id)
    const wardId = parseInt(office.officeId.replace('WARD-', ''));
    if (!isNaN(wardId)) {
      await prisma.wardOffice.upsert({
        where: { officeId: office.id },
        update: {},
        create: {
          officeId: office.id,
          wardId,
        },
      });
      wardLinks++;
    }
  }
  console.log(`  ✓ Linked ${wardLinks} Ward Offices to wards.`);

  // 3. (Optional) Link municipality/district/province offices if needed
  // Add similar logic for other office types as your data grows

  console.log('🏁 Office-location seeding complete.\n');
}

if (require.main === module) {
  const { PrismaPg } = require('@prisma/adapter-pg');
  const pg = require('pg');
  const dbUrl = String(process.env.DATABASE_URL || '').trim();
  let finalConnectionUrl;
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
  seedOfficeLocations(prisma).then(() => prisma.$disconnect());
}
