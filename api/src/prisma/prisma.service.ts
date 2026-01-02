import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/prisma/client';
import pg from 'pg'

@Injectable()
export class PrismaService extends PrismaClient {
    constructor(){
        const dbUrl = String(process.env.DATABASE_URL || '').trim();
        const urlObj = new URL(dbUrl);
        if (!urlObj.password) throw new Error('Password missing in DATABASE_URL');
        urlObj.password = encodeURIComponent(String(urlObj.password));
        const finalConnectionUrl = urlObj.href;
        const pool = new pg.Pool({ connectionString: finalConnectionUrl });
        const adapter = new PrismaPg(pool);
        super({ adapter });
    }
}
