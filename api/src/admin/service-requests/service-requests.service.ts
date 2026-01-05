import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateServiceRequestDto,
  ReviewServiceRequestDto,
  RejectServiceRequestDto,
  ServiceRequestQueryDto,
} from '../dto/service-request.dto';

@Injectable()
export class ServiceRequestsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new service request (Office Admin)
   */
  async createRequest(dto: CreateServiceRequestDto, userId: string) {
    // Check if user is an office admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { managedOffice: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'OFFICE_ADMIN') {
      throw new ForbiddenException(
        'Only office admins can request new services',
      );
    }

    // Use managed office if no officeId provided
    const officeId = dto.officeId || user.managedOffice?.id;

    // Check for duplicate service name request
    const existingRequest = await this.prisma.serviceRequest.findFirst({
      where: {
        serviceName: { equals: dto.serviceName, mode: 'insensitive' },
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      throw new ConflictException(
        'A pending request for a service with this name already exists',
      );
    }

    // Check if service with similar name already exists
    const existingService = await this.prisma.service.findFirst({
      where: {
        name: { equals: dto.serviceName, mode: 'insensitive' },
      },
    });

    if (existingService) {
      throw new ConflictException(
        `A service with name "${dto.serviceName}" already exists. Please claim the existing service instead.`,
      );
    }

    // Validate category if provided
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new BadRequestException('Invalid category ID');
      }
    }

    const serviceRequest = await this.prisma.serviceRequest.create({
      data: {
        requestedBy: userId,
        officeId,
        serviceName: dto.serviceName,
        serviceDescription: dto.serviceDescription,
        categoryId: dto.categoryId,
        priority: dto.priority,
        justification: dto.justification,
        status: 'PENDING',
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        office: {
          select: {
            id: true,
            officeId: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Service request submitted successfully',
      data: serviceRequest,
    };
  }

  /**
   * Get all service requests (Admin) or own requests (Office Admin)
   */
  async getRequests(
    query: ServiceRequestQueryDto,
    userId: string,
    userRole: string,
  ) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Office admins can only see their own requests
    if (userRole === 'OFFICE_ADMIN') {
      where.requestedBy = userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.officeId) {
      where.officeId = query.officeId;
    }

    const [requests, total] = await Promise.all([
      this.prisma.serviceRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          requester: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          office: {
            select: {
              id: true,
              officeId: true,
              name: true,
            },
          },
          approvedService: {
            select: {
              id: true,
              serviceId: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.serviceRequest.count({ where }),
    ]);

    return {
      data: requests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single service request by ID
   */
  async getRequestById(requestId: string, userId: string, userRole: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        office: {
          select: {
            id: true,
            officeId: true,
            name: true,
            nameNepali: true,
            address: true,
          },
        },
        approvedService: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    // Office admins can only view their own requests
    if (userRole === 'OFFICE_ADMIN' && request.requestedBy !== userId) {
      throw new ForbiddenException(
        'You can only view your own service requests',
      );
    }

    return request;
  }

  /**
   * Approve a service request (Super Admin only)
   */
  async approveRequest(
    requestId: string,
    dto: ReviewServiceRequestDto,
    userId: string,
  ) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    if (request.status !== 'PENDING') {
      throw new ConflictException(
        `Cannot approve a request with status: ${request.status}`,
      );
    }

    // Generate unique service ID and slug
    const serviceId = await this.generateServiceId();
    const slug = this.generateSlug(request.serviceName);

    // Create the new service and update request in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the new service
      const newService = await tx.service.create({
        data: {
          serviceId,
          name: request.serviceName,
          slug,
          description: request.serviceDescription,
          priority: request.priority,
          level: 0, // Root level service
        },
      });

      // If category was requested, create the association
      if (request.categoryId) {
        await tx.serviceCategory.create({
          data: {
            serviceId: newService.id,
            categoryId: request.categoryId,
          },
        });
      }

      // Update the service request
      const updatedRequest = await tx.serviceRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          reviewedBy: userId,
          reviewedAt: new Date(),
          reviewNotes: dto.reviewNotes,
          approvedServiceId: newService.id,
        },
        include: {
          requester: {
            select: { id: true, username: true, fullName: true },
          },
          approvedService: {
            include: {
              categories: { include: { category: true } },
            },
          },
        },
      });

      // Auto-claim the service for the requesting office if officeId exists
      if (request.officeId) {
        await tx.officeService.create({
          data: {
            officeId: request.officeId,
            serviceId: newService.id,
            status: 'CLAIMED',
            claimedBy: request.requestedBy,
            notes: 'Auto-claimed upon service request approval',
          },
        });
      }

      return updatedRequest;
    });

    return {
      message: 'Service request approved and new service created',
      data: result,
    };
  }

  /**
   * Reject a service request (Super Admin only)
   */
  async rejectRequest(
    requestId: string,
    dto: RejectServiceRequestDto,
    userId: string,
  ) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    if (request.status !== 'PENDING') {
      throw new ConflictException(
        `Cannot reject a request with status: ${request.status}`,
      );
    }

    const updatedRequest = await this.prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        reviewedBy: userId,
        reviewedAt: new Date(),
        reviewNotes: dto.reviewNotes,
        rejectionReason: dto.rejectionReason,
      },
      include: {
        requester: {
          select: { id: true, username: true, fullName: true, email: true },
        },
        office: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      message: 'Service request rejected',
      data: updatedRequest,
    };
  }

  /**
   * Get statistics for service requests
   */
  async getStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.serviceRequest.count(),
      this.prisma.serviceRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.serviceRequest.count({ where: { status: 'APPROVED' } }),
      this.prisma.serviceRequest.count({ where: { status: 'REJECTED' } }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }

  // Helper methods
  private async generateServiceId(): Promise<string> {
    const count = await this.prisma.service.count();
    return `SVC-${String(count + 1).padStart(6, '0')}`;
  }

  private generateSlug(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36)
    );
  }
}
