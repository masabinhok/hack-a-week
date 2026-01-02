import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubServicesService {
    constructor(private readonly prisma: PrismaService){}

    async getSubServiceBySlug(slug: string) {
        return this.prisma.subService.findUnique({
            where: {
                slug
            },
            include: {
                serviceSteps: {
                    include: {
                        documentsRequired: true,
                        totalFees: true,
                        timeRequired: true,
                        workingHours: true,
                        responsibleAuthorities: true,
                        complaintAuthorities: true
                    }
                },
                detailedProc: true,
                offices: true
            }
        })
    }
}
