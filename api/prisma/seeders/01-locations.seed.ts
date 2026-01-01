import { PrismaClient } from 'src/generated/prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface ProvinceData {
  province_id: number;
  name: string;
  nepali_name: string;
}

interface DistrictData {
  district_id: number;
  name: string;
  nepali_name: string;
  province_id: number;
}

interface MunicipalityData {
  municipality_id: number;
  name: string;
  nepali_name: string;
  district_id: number;
  local_level_type_id: number;
}

interface WardCounts {
  [municipalityId: string]: number;
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function getMunicipalityType(localLevelTypeId: number): string {
  switch (localLevelTypeId) {
    case 1:
      return 'Metropolitan City';
    case 2:
      return 'Sub-Metropolitan City';
    case 3:
      return 'Municipality';
    case 4:
      return 'Rural Municipality';
    default:
      return 'Municipality';
  }
}

function loadJsonData<T>(filename: string): T {
  const filePath = path.join(__dirname, '../data', filename);
  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function seedLocations(prisma: PrismaClient) {
  const provinces = loadJsonData<ProvinceData[]>('provinces.json');
  const districts = loadJsonData<DistrictData[]>('districts.json');
  const municipalities = loadJsonData<MunicipalityData[]>('municipalities.json');
  const wardCounts = loadJsonData<WardCounts>('wards.json');

  // Provinces
  for (const province of provinces) {
    await prisma.province.upsert({
      where: { id: province.province_id },
      update: {
        name: province.name,
        nameNep: province.nepali_name,
        slug: createSlug(province.name),
      },
      create: {
        id: province.province_id,
        name: province.name,
        nameNep: province.nepali_name,
        slug: createSlug(province.name),
      },
    });
  }
  console.log(`✅ [Locations] Provinces seeded: ${provinces.length}`);

  // Districts
  for (const district of districts) {
    await prisma.district.upsert({
      where: { id: district.district_id },
      update: {
        name: district.name,
        nameNep: district.nepali_name,
        slug: createSlug(district.name),
        provinceId: district.province_id,
      },
      create: {
        id: district.district_id,
        name: district.name,
        nameNep: district.nepali_name,
        slug: createSlug(district.name),
        provinceId: district.province_id,
      },
    });
  }
  console.log(`✅ [Locations] Districts seeded: ${districts.length}`);

  // Municipalities
  for (const municipality of municipalities) {
    await prisma.municipality.upsert({
      where: {
        districtId_slug: {
          districtId: municipality.district_id,
          slug: createSlug(municipality.name),
        },
      },
      update: {
        name: municipality.name,
        nameNep: municipality.nepali_name,
        type: getMunicipalityType(municipality.local_level_type_id),
      },
      create: {
        id: municipality.municipality_id,
        name: municipality.name,
        nameNep: municipality.nepali_name,
        slug: createSlug(municipality.name),
        type: getMunicipalityType(municipality.local_level_type_id),
        districtId: municipality.district_id,
      },
    });
  }
  console.log(`✅ [Locations] Municipalities seeded: ${municipalities.length}`);

  // Wards
  let totalWards = 0;
  for (const [municipalityId, wardCount] of Object.entries(wardCounts)) {
    const wardData = Array.from({ length: wardCount as number }, (_, i) => ({
      municipalityId: Number(municipalityId),
      wardNumber: i + 1,
    }));
    await prisma.ward.createMany({
      data: wardData,
      skipDuplicates: true,
    });
    totalWards += wardData.length;
  }
  console.log(`✅ [Locations] Wards seeded: ${totalWards}`);
}

// Allow running standalone for testing
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
  seedLocations(prisma).then(() => prisma.$disconnect());
}
