// Seeder for linking services to offices
import { PrismaClient } from 'src/generated/prisma/client';

export async function seedServiceOffices(prisma: PrismaClient) {
  console.log('🔗 [ServiceOffices] Skipping - using office type + location for queries\n');
  
  // TODO: Implement later if needed for:
  // - Service availability exceptions
  // - Multiple office type options
  // - Office service catalog feature
}