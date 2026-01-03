import { OfficeType, PrismaClient } from 'src/generated/prisma/client';

export async function seedOffices(prisma: PrismaClient) {
  console.log('🏢 [Offices] Seeding offices...\n');

  // 1. Get office categories first
  const daoCategory = await prisma.officeCategory.findUnique({
    where: { name: 'DISTRICT_ADMINISTRATION_OFFICE' }
  });
  
  const wardCategory = await prisma.officeCategory.findUnique({
    where: { name: 'WARD_OFFICE' }
  });

  const nationalIdCategory = await prisma.officeCategory.findUnique({
    where: { name: 'NATIONAL_ID_CENTER' }
  });

  if (!daoCategory || !wardCategory || !nationalIdCategory) {
    throw new Error('Office categories not found! Seed them first.');
  }

  // 2. Generate DAOs (77 total - one per district)
  console.log('  → [Offices] Generating District Administration Offices...');
  
  const districts = await prisma.district.findMany({
    include: { province: true }
  });

  let daoCount = 0;
  for (const district of districts) {
    const officeId = `DAO-${district.id.toString().padStart(3, '0')}`;
    
    await prisma.office.upsert({
      where: { officeId },
      update: {},
      create: {
        officeId,
        categoryId: daoCategory.id,
        name: `${district.name} District Administration Office`,
        nameNepali: `${district.nameNep || district.name} जिल्ला प्रशासन कार्यालय`,
        type: 'DISTRICT_ADMINISTRATION_OFFICE',
        address: `${district.name} District`,
        addressNepali: `${district.nameNep || district.name} जिल्ला`,
        contact: null,
        alternateContact: null,
        email: null,
        website: null,
        photoUrls: [],
        facilities: [],
        nearestLandmark: null,
        publicTransport: null,
        isActive: true,
      }
    });
    
    daoCount++;
    if (daoCount % 10 === 0) {
      console.log(`    [Offices] Created ${daoCount}/${districts.length} DAOs...`);
    }
  }
  
  console.log(`  ✓ [Offices] Created ${daoCount} District Administration Offices\n`);

  // 2.5. Create special NID enrollment center - Narayan Hiti Durbar
  console.log('  → [Offices] Creating special NID enrollment center...');
  
  // Get Kathmandu district for location reference
  const kathmandu = await prisma.district.findFirst({
    where: { name: 'Kathmandu' },
    include: { province: true }
  });

  if (kathmandu) {
    const narayanHitiOffice = await prisma.office.upsert({
      where: { officeId: 'OFFICE-NARAYAN-HITI-DURBAR' },
      update: {},
      create: {
        officeId: 'OFFICE-NARAYAN-HITI-DURBAR',
        categoryId: nationalIdCategory.id,
        name: 'Narayan Hiti Durbar NID Enrollment Center',
        nameNepali: 'नारायणहिटी दरबार राष्ट्रिय परिचयपत्र दर्ता केन्द्र',
        type: 'NATIONAL_ID_CENTER',
        address: 'Narayan Hiti Palace (Old Passport Department), Kathmandu',
        addressNepali: 'नारायणहिटी दरबार (पुरानो राहदानी विभाग), काठमाडौं',
        contact: '01-4107000',
        alternateContact: null,
        email: 'nid@donidcr.gov.np',
        website: 'https://enrollment.donidcr.gov.np',
        photoUrls: [],
        facilities: [
          'Biometric enrollment',
          'NID card distribution',
          'Document verification',
          'Online appointment system'
        ],
        nearestLandmark: 'Near Thamel, Kathmandu',
        publicTransport: 'Multiple bus routes to Thamel area',
        isActive: true,
      }
    });
    
    // Link to Kathmandu district
    await prisma.districtOffice.upsert({
      where: { officeId: narayanHitiOffice.id },
      update: {},
      create: {
        officeId: narayanHitiOffice.id,
        districtId: kathmandu.id,
      }
    });
    
    console.log(`  ✓ [Offices] Created Narayan Hiti Durbar NID Enrollment Center\n`);
  }

  // 3. Generate Ward Offices (6,743 total)
  console.log('  → [Offices] Generating Ward Offices...');
  
  const wards = await prisma.ward.findMany({
    include: { 
      municipality: { 
        include: { district: true } 
      } 
    }
  });

  let wardOfficeCount = 0;
  const batchSize = 100; // Insert in batches for performance

  for (let i = 0; i < wards.length; i += batchSize) {
    const batch = wards.slice(i, i + batchSize);
    
    const officeData = batch.map(ward => {
      const officeId = `WARD-${ward.id.toString().padStart(5, '0')}`;
      
      return {
        officeId,
        categoryId: wardCategory.id,
        name: `${ward.municipality.name} Ward No. ${ward.wardNumber} Office`,
        nameNepali: `${ward.municipality.nameNep || ward.municipality.name} वडा नं. ${ward.wardNumber} कार्यालय`,
        type: OfficeType.WARD_OFFICE,
        address: `${ward.municipality.district.name} District`,
        addressNepali: `${ward.municipality.district.nameNep || ward.municipality.district.name} जिल्ला`,
        contact: null,
        alternateContact: null,
        email: null,
        website: null,
        photoUrls: [],
        facilities: [],
        nearestLandmark: null,
        publicTransport: null,
        isActive: true,
      };
    });

    await prisma.office.createMany({
      data: officeData,
      skipDuplicates: true,
    });

    wardOfficeCount += batch.length;
    console.log(`    [Offices] Created ${wardOfficeCount}/${wards.length} Ward Offices...`);
  }

  console.log(`  ✓ [Offices] Created ${wardOfficeCount} Ward Offices\n`);
  console.log(`✅ [Offices] Total offices created: ${daoCount + wardOfficeCount}\n`);
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
  seedOffices(prisma).then(() => prisma.$disconnect());
}
