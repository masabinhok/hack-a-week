import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServicesService {
    constructor(private readonly prisma: PrismaService){}

    async getAllServices() {
        return this.prisma.service.findMany();
    }

    async getServiceBySlug(slug: string) {
        return this.prisma.service.findUnique({
            where: {
                slug
            },
            include:{
                subServices: true
            }
        })
    }
}
