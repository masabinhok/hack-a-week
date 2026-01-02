/**
 * Detailed Procedures Seeder (Updated for Self-Referential Service Model)
 * Seeds detailed procedures including FAQs, common issues, and legal references
 * Uses serviceSlug instead of subServiceSlug
 * 
 * @module prisma/seeders/10-detailed-proc.seed
 */
import { PrismaClient } from 'src/generated/prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface LegalReference {
  lawName: string;
  lawNameNepali?: string;
  section: string;
  url?: string;
}

interface FAQ {
  question: string;
  questionNepali?: string;
  answer: string;
  answerNepali?: string;
}

interface CommonIssue {
  issue: string;
  issueNepali?: string;
  solution: string;
  solutionNepali?: string;
}

interface DetailedProcData {
  serviceSlug: string;
  overview: string;
  overviewNepali?: string;
  stepByStepGuide: string[];
  importantNotes: string[];
  legalReferences: LegalReference[];
  faqs: FAQ[];
  commonIssues: CommonIssue[];
}

function readJsonFile<T>(filename: string): T {
  const filePath = path.join(__dirname, '../data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function seedDetailedProc(prisma: PrismaClient): Promise<void> {
  console.log('📖 Seeding detailed procedures...\n');

  const procs = readJsonFile<DetailedProcData[]>('detailed-proc.json');
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const proc of procs) {
    // Find service by slug
    const service = await prisma.service.findFirst({
      where: { slug: proc.serviceSlug },
      select: { id: true }
    });

    if (!service) {
      console.warn(`  ⚠️ Service not found: ${proc.serviceSlug}`);
      skipped++;
      continue;
    }

    // Check if detailed proc already exists
    const existing = await prisma.detailedProc.findUnique({
      where: { serviceId: service.id }
    });

    const procData = {
      overview: proc.overview,
      overviewNepali: proc.overviewNepali,
      stepByStepGuide: proc.stepByStepGuide,
      importantNotes: proc.importantNotes,
      legalReferences: proc.legalReferences as any, // JSON type
      faqs: proc.faqs as any, // JSON type
      commonIssues: proc.commonIssues as any, // JSON type
    };

    if (existing) {
      await prisma.detailedProc.update({
        where: { serviceId: service.id },
        data: procData,
      });
      updated++;
    } else {
      await prisma.detailedProc.create({
        data: {
          ...procData,
          serviceId: service.id,
        },
      });
      created++;
    }
  }

  console.log(`  ✅ Detailed Procedures: ${created} created, ${updated} updated, ${skipped} skipped (${procs.length} total)\n`);
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
  
  seedDetailedProc(prisma)
    .then(() => prisma.$disconnect())
    .then(() => pool.end())
    .catch((e) => {
      console.error('❌ Seeding failed:', e);
      process.exit(1);
    });
}
