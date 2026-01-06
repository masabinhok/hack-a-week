import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ClaimServiceDto,
  UpdateOfficeServiceDto,
  OfficeServiceQueryDto,
} from '../dto/office-service.dto';

@Injectable()
export class OfficeServicesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all global services that can be claimed
   */
  async getAvailableServices(
    officeId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    // Get services that haven't been claimed by this office yet
    const where: any = {
      // Only leaf services can be claimed (no children)
      children: { none: {} },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        include: {
          categories: {
            include: { category: true },
          },
          officeServices: {
            where: { officeId },
            select: { id: true, status: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.service.count({ where }),
    ]);

    // Map to add claimed status
    const servicesWithStatus = services.map((service) => ({
      ...service,
      isClaimedByOffice: service.officeServices.length > 0,
      claimStatus: service.officeServices[0]?.status || null,
      officeServices: undefined, // Remove from response
    }));

    return {
      data: servicesWithStatus,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get services claimed by a specific office
   */
  async getOfficeServices(officeId: string, query: OfficeServiceQueryDto) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const skip = (page - 1) * limit;

    const where: any = { officeId };
    if (query.status) {
      where.status = query.status;
    }

    const [officeServices, total] = await Promise.all([
      this.prisma.officeService.findMany({
        where,
        skip,
        take: limit,
        include: {
          service: {
            include: {
              categories: {
                include: { category: true },
              },
            },
          },
        },
        orderBy: { claimedAt: 'desc' },
      }),
      this.prisma.officeService.count({ where }),
    ]);

    return {
      data: officeServices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Claim a service for an office
   */
  async claimService(officeId: string, dto: ClaimServiceDto, userId: string) {
    // Check if office exists
    const office = await this.prisma.office.findUnique({
      where: { id: officeId },
    });

    if (!office) {
      throw new NotFoundException('Office not found');
    }

    // Check if service exists
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
      include: { children: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Only leaf services can be claimed
    if (service.children.length > 0) {
      throw new ConflictException(
        'Cannot claim a parent service. Please claim specific sub-services.',
      );
    }

    // Check if already claimed
    const existingClaim = await this.prisma.officeService.findUnique({
      where: {
        officeId_serviceId: {
          officeId,
          serviceId: dto.serviceId,
        },
      },
    });

    if (existingClaim) {
      if (existingClaim.status === 'CLAIMED') {
        throw new ConflictException(
          'Service is already claimed by this office',
        );
      }
      if (existingClaim.status === 'REVOKED') {
        // Re-claim a previously revoked service
        return this.prisma.officeService.update({
          where: { id: existingClaim.id },
          data: {
            status: 'CLAIMED',
            customDescription: dto.customDescription,
            customFees: dto.customFees,
            customRequirements: dto.customRequirements || [],
            notes: dto.notes,
            claimedBy: userId,
            claimedAt: new Date(),
            revokedAt: null,
            revokedBy: null,
          },
          include: {
            service: {
              include: {
                categories: { include: { category: true } },
              },
            },
          },
        });
      }
    }

    // Create new claim
    const officeService = await this.prisma.officeService.create({
      data: {
        officeId,
        serviceId: dto.serviceId,
        status: 'CLAIMED',
        customDescription: dto.customDescription,
        customFees: dto.customFees,
        customRequirements: dto.customRequirements || [],
        notes: dto.notes,
        claimedBy: userId,
      },
      include: {
        service: {
          include: {
            categories: { include: { category: true } },
          },
        },
      },
    });

    return {
      message: 'Service claimed successfully',
      data: officeService,
    };
  }

  /**
   * Update office-specific service details
   */
  async updateOfficeService(
    officeId: string,
    officeServiceId: string,
    dto: UpdateOfficeServiceDto,
    _userId: string,
  ) {
    const officeService = await this.prisma.officeService.findFirst({
      where: {
        id: officeServiceId,
        officeId,
      },
    });

    if (!officeService) {
      throw new NotFoundException('Office service claim not found');
    }

    const updated = await this.prisma.officeService.update({
      where: { id: officeServiceId },
      data: {
        customDescription: dto.customDescription,
        customFees: dto.customFees,
        customRequirements: dto.customRequirements,
        notes: dto.notes,
      },
      include: {
        service: {
          include: {
            categories: { include: { category: true } },
          },
        },
      },
    });

    return {
      message: 'Office service updated successfully',
      data: updated,
    };
  }

  /**
   * Revoke/unclaim a service from an office
   */
  async revokeService(
    officeId: string,
    officeServiceId: string,
    userId: string,
  ) {
    const officeService = await this.prisma.officeService.findFirst({
      where: {
        id: officeServiceId,
        officeId,
      },
    });

    if (!officeService) {
      throw new NotFoundException('Office service claim not found');
    }

    if (officeService.status === 'REVOKED') {
      throw new ConflictException('Service is already revoked');
    }

    const updated = await this.prisma.officeService.update({
      where: { id: officeServiceId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revokedBy: userId,
      },
    });

    return {
      message: 'Service revoked successfully',
      data: updated,
    };
  }

  /**
   * Get single office service claim details
   */
  async getOfficeServiceById(officeId: string, officeServiceId: string) {
    const officeService = await this.prisma.officeService.findFirst({
      where: {
        id: officeServiceId,
        officeId,
      },
      include: {
        service: {
          include: {
            categories: { include: { category: true } },
            serviceSteps: {
              include: {
                documentsRequired: true,
                totalFees: true,
                timeRequired: true,
              },
              orderBy: { step: 'asc' },
            },
          },
        },
        office: {
          select: {
            id: true,
            officeId: true,
            name: true,
            nameNepali: true,
          },
        },
      },
    });

    if (!officeService) {
      throw new NotFoundException('Office service claim not found');
    }

    return officeService;
  }
}
