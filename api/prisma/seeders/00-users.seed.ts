import 'dotenv/config';
import { PrismaClient, UserRole } from 'src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Seed users including:
 * - Super Admin user
 * - Office Admin users (created and linked to offices)
 */
export async function seedUsers(prisma: PrismaClient) {
  console.log('👤 Seeding users...\n');

  // 1. Create Super Admin
  console.log('  → Creating super admin user...');
  
  const adminUsername = 'admin';
  const adminPassword = 'admin123456';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const superAdmin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      passwordHash: hashedAdminPassword,
      role: 'ADMIN',
      fullName: 'System Administrator',
      isActive: true,
    },
  });

  console.log(`  ✓ Super admin created: ${superAdmin.username}\n`);

  // 2. Create Office Admin users for all existing offices
  console.log('  → Creating office admin users...');

  const offices = await prisma.office.findMany({
    where: {
      officeAdminId: null, // Only offices without an admin
    },
    select: {
      id: true,
      officeId: true,
      name: true,
      email: true,
    },
  });

  console.log(`    Found ${offices.length} offices without admin users`);

  let createdCount = 0;
  let skippedCount = 0;
  const batchSize = 100;

  // Process in batches
  for (let i = 0; i < offices.length; i += batchSize) {
    const batch = offices.slice(i, i + batchSize);
    
    for (const office of batch) {
      try {
        // Generate username from office ID
        const username = generateOfficeAdminUsername(office.officeId);
        
        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
          where: { username },
          include: {
            managedOffice: true,
          },
        });

        if (existingUser) {
          // Link existing user to office if not already linked
          if (!existingUser.managedOffice) {
            await prisma.office.update({
              where: { id: office.id },
              data: { officeAdminId: existingUser.id },
            });
          }
          skippedCount++;
          continue;
        }

        // Generate a consistent seeder password (for development)
        // In production, this should be randomly generated and emailed
        const password = generateSeederPassword(office.officeId);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and link to office in transaction
        await prisma.$transaction(async (tx) => {
          const officeAdmin = await tx.user.create({
            data: {
              username,
              passwordHash: hashedPassword,
              role: 'OFFICE_ADMIN',
              fullName: `Admin - ${office.name}`,
              isActive: true,
            },
          });

          await tx.office.update({
            where: { id: office.id },
            data: { officeAdminId: officeAdmin.id },
          });
        });

        createdCount++;
      } catch (error) {
        console.error(`    ❌ Failed to create admin for office ${office.officeId}:`, error);
      }
    }

    console.log(`    Processed ${Math.min(i + batchSize, offices.length)}/${offices.length} offices...`);
  }

  console.log(`  ✓ Created ${createdCount} office admin users`);
  console.log(`  ⏭️  Skipped ${skippedCount} (already had users)\n`);

  // 3. Summary
  const totalUsers = await prisma.user.count();
  const adminUsers = await prisma.user.count({ where: { role: 'ADMIN' } });
  const officeAdminUsers = await prisma.user.count({ where: { role: 'OFFICE_ADMIN' } });
  const regularUsers = await prisma.user.count({ where: { role: 'USER' } });

  console.log('📊 User Summary:');
  console.log(`   Total Users: ${totalUsers}`);
  console.log(`   - ADMIN: ${adminUsers}`);
  console.log(`   - OFFICE_ADMIN: ${officeAdminUsers}`);
  console.log(`   - USER: ${regularUsers}\n`);
}

/**
 * Generate username for office admin based on office ID
 * Format: office_<cleaned_office_id>
 */
function generateOfficeAdminUsername(officeId: string): string {
  const cleanId = officeId.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `office_${cleanId}`;
}

/**
 * Generate a consistent seeder password based on office ID
 * This is for development/seeding only - production should use secure random passwords
 * Format: Office<last4digits>!Np
 */
function generateSeederPassword(officeId: string): string {
  // Extract digits from office ID or use a hash
  const digits = officeId.replace(/\D/g, '').slice(-4).padStart(4, '0');
  return `Office${digits}!Np`;
}

// Run directly if called as a script
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
  
  seedUsers(prisma)
    .then(() => {
      console.log('✅ User seeding completed!');
      return prisma.$disconnect();
    })
    .then(() => pool.end())
    .catch((e) => {
      console.error('❌ User seeding failed:', e);
      process.exit(1);
    });
}
