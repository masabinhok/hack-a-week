import { PrismaClient } from 'src/generated/prisma/client';

export async function seedOfficeCategories(prisma: PrismaClient) {
  console.log('🏢 [OfficeCategory] Seeding office categories...');
  // Office categories with slugs and abbreviations
  const categories = [
    { name: 'DISTRICT_ADMINISTRATION_OFFICE', slug: 'district-administration-office', abbreviation: 'DAO', description: 'District Administration Office (DAO) - Citizenship, recommendations, certificates' },
    { name: 'LAND_REVENUE_OFFICE', slug: 'land-revenue-office', abbreviation: 'LRO', description: 'Land Revenue Office (Malpot) - Land registration, ownership transfer' },
    { name: 'DISTRICT_EDUCATION_OFFICE', slug: 'district-education-office', abbreviation: 'DEO', description: 'District Education Office - SEE/SLC verification, certificate attestation' },
    { name: 'TRANSPORT_MANAGEMENT_OFFICE', slug: 'transport-management-office', abbreviation: 'TMO', description: 'Transport Management Office - Vehicle registration, blue book, license' },
    { name: 'DRIVING_LICENSE_OFFICE', slug: 'driving-license-office', abbreviation: 'DLO', description: 'Driving License Office - License tests and renewals' },
    { name: 'MUNICIPALITY_OFFICE', slug: 'municipality-office', abbreviation: 'MUN', description: 'Municipality Office (Nagarpalika) - Local services, business tax' },
    { name: 'RURAL_MUNICIPALITY_OFFICE', slug: 'rural-municipality-office', abbreviation: 'RMO', description: 'Rural Municipality Office (Gaupalika) - Rural local services' },
    { name: 'WARD_OFFICE', slug: 'ward-office', abbreviation: 'WARD', description: 'Ward Office - Birth/death registration, business registration, recommendations' },
    { name: 'PASSPORT_OFFICE', slug: 'passport-office', abbreviation: 'PPO', description: 'Passport Office - Passport applications and renewals' },
    { name: 'IMMIGRATION_OFFICE', slug: 'immigration-office', abbreviation: 'IMM', description: 'Immigration Office - Visa, travel documents' },
    { name: 'OFFICE_OF_COMPANY_REGISTRAR', slug: 'office-of-company-registrar', abbreviation: 'OCR', description: 'Office of Company Registrar (OCR) - Company registration (e-OCR/CAMIS)' },
    { name: 'COTTAGE_SMALL_INDUSTRY_OFFICE', slug: 'cottage-small-industry-office', abbreviation: 'DCSI', description: 'Cottage & Small Industry Office (DCSI) - Cottage/small industry registration' },
    { name: 'INLAND_REVENUE_OFFICE', slug: 'inland-revenue-office', abbreviation: 'IRO', description: 'Inland Revenue Office (IRD) - PAN/VAT registration, tax filing' },
    { name: 'LABOUR_OFFICE', slug: 'labour-office', abbreviation: 'LBR', description: 'Labour Office - Foreign employment, work permits, labor disputes' },
  ];
  await prisma.officeCategory.createMany({ data: categories, skipDuplicates: true });
  console.log('✅ [OfficeCategory] Seeded office categories.');
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
  seedOfficeCategories(prisma).then(() => prisma.$disconnect());
}
