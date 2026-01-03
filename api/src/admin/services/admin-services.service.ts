import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto, CreateServiceStepDto } from '../dto/create-service.dto';
// Using raw Prisma types for service input
type PrismaServiceCreateInput = any;
type PrismaServiceUpdateInput = any;
type PrismaServiceWhereInput = any;

@Injectable()
export class AdminServicesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all services with pagination and search
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    parentId?: string | null;
  }) {
    const { page = 1, limit = 20, search, parentId } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { serviceId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          _count: {
            select: {
              children: true,
              serviceSteps: true,
            },
          },
        },
        orderBy: [{ level: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data: services.map((service) => ({
        ...service,
        childrenCount: service._count.children,
        stepsCount: service._count.serviceSteps,
        categories: service.categories.map((c) => c.category),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single service by ID with all nested relations
   */
  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            serviceId: true,
            name: true,
            slug: true,
            level: true,
            priority: true,
            _count: {
              select: {
                children: true,
                serviceSteps: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        },
        categories: {
          include: {
            category: true,
          },
        },
        serviceSteps: {
          include: {
            documentsRequired: true,
            totalFees: true,
            timeRequired: true,
            workingHours: true,
            responsibleAuthorities: true,
            complaintAuthorities: true,
          },
          orderBy: { step: 'asc' },
        },
        detailedProc: true,
        metadata: true,
        _count: {
          select: {
            children: true,
            serviceSteps: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    // Workaround for Prisma adapter-pg bug with enum arrays
    if (service.serviceSteps.length > 0) {
      const stepIds = service.serviceSteps.map(s => s.id);
      const officeTypesResult = await this.prisma.$queryRaw<{ id: string; officeTypes: string[] }[]>`
        SELECT id, "officeTypes"::text[] as "officeTypes" FROM "ServiceStep" WHERE id = ANY(${stepIds})
      `;
      const officeTypesMap = new Map(officeTypesResult.map(r => [r.id, r.officeTypes || []]));
      
      service.serviceSteps = service.serviceSteps.map(step => ({
        ...step,
        officeTypes: officeTypesMap.get(step.id) || [],
      })) as any;
    }

    return {
      ...service,
      childrenCount: service._count.children,
      stepsCount: service._count.serviceSteps,
      categories: service.categories.map((c) => c.category),
    };
  }

  /**
   * Create a new service with all nested relations
   */
  async create(dto: CreateServiceDto) {
    // Check if serviceId or slug already exists
    const existing = await this.prisma.service.findFirst({
      where: {
        OR: [
          { serviceId: dto.serviceId },
          { slug: dto.slug, parentId: dto.parentId || null },
        ],
      },
    });

    if (existing) {
      throw new ConflictException(
        `Service with serviceId "${dto.serviceId}" or slug "${dto.slug}" already exists`
      );
    }

    // Build the create data
    const createData: any = {
      serviceId: dto.serviceId,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      priority: dto.priority as any,
      isOnlineEnabled: dto.isOnlineEnabled || false,
      onlinePortalUrl: dto.onlinePortalUrl,
      eligibility: dto.eligibility,
      validityPeriod: dto.validityPeriod,
      level: dto.level || 0,
    };

    // Connect parent if provided
    if (dto.parentId) {
      const parent = await this.prisma.service.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent service with ID ${dto.parentId} not found`);
      }
      createData.parent = { connect: { id: dto.parentId } };
      createData.level = parent.level + 1;
    }

    // Create categories if provided
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      createData.categories = {
        create: dto.categoryIds.map((categoryId) => ({
          category: { connect: { id: categoryId } },
        })),
      };
    }

    // Create service steps with nested relations
    if (dto.steps && dto.steps.length > 0) {
      createData.serviceSteps = {
        create: dto.steps.map((step) => this.buildStepCreateData(step)),
      };
    }

    // Create detailed procedure
    if (dto.detailedProc) {
      createData.detailedProc = {
        create: {
          overview: dto.detailedProc.overview,
          overviewNepali: dto.detailedProc.overviewNepali,
          stepByStepGuide: dto.detailedProc.stepByStepGuide || [],
          importantNotes: dto.detailedProc.importantNotes || [],
          legalReferences: dto.detailedProc.legalReferences || [],
          faqs: dto.detailedProc.faqs || [],
          commonIssues: dto.detailedProc.commonIssues || [],
        },
      };
    }

    // Create metadata
    if (dto.metadata) {
      createData.metadata = {
        create: {
          version: dto.metadata.version,
          dataSource: dto.metadata.dataSource,
          verifiedBy: dto.metadata.verifiedBy,
        },
      };
    }

    const service = await this.prisma.service.create({
      data: createData,
      include: {
        parent: true,
        categories: { include: { category: true } },
        serviceSteps: {
          include: {
            documentsRequired: true,
            totalFees: true,
            timeRequired: true,
            workingHours: true,
            responsibleAuthorities: true,
            complaintAuthorities: true,
          },
        },
        detailedProc: true,
        metadata: true,
      },
    });

    return {
      message: 'Service created successfully',
      data: service,
    };
  }

  /**
   * Update a service by ID
   */
  async update(id: string, dto: UpdateServiceDto) {
    const existing = await this.prisma.service.findUnique({
      where: { id },
      include: {
        categories: true,
        serviceSteps: true,
        detailedProc: true,
        metadata: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    // Check for slug conflicts
    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.prisma.service.findFirst({
        where: {
          slug: dto.slug,
          parentId: dto.parentId || existing.parentId,
          id: { not: id },
        },
      });
      if (slugExists) {
        throw new ConflictException(`Slug "${dto.slug}" already exists for this parent`);
      }
    }

    // Build update data
    const updateData: any = {
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      priority: dto.priority as any,
      isOnlineEnabled: dto.isOnlineEnabled,
      onlinePortalUrl: dto.onlinePortalUrl,
      eligibility: dto.eligibility,
      validityPeriod: dto.validityPeriod,
    };

    // Handle parent update
    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        updateData.parent = { disconnect: true };
        updateData.level = 0;
      } else if (dto.parentId !== existing.parentId) {
        const parent = await this.prisma.service.findUnique({
          where: { id: dto.parentId },
        });
        if (!parent) {
          throw new NotFoundException(`Parent service with ID ${dto.parentId} not found`);
        }
        updateData.parent = { connect: { id: dto.parentId } };
        updateData.level = parent.level + 1;
      }
    }

    // Update categories - delete existing and create new
    if (dto.categoryIds !== undefined) {
      await this.prisma.serviceCategory.deleteMany({
        where: { serviceId: id },
      });

      if (dto.categoryIds.length > 0) {
        await this.prisma.serviceCategory.createMany({
          data: dto.categoryIds.map((categoryId) => ({
            serviceId: id,
            categoryId,
          })),
        });
      }
    }

    // Update steps - delete existing and create new
    if (dto.steps !== undefined) {
      await this.prisma.serviceStep.deleteMany({
        where: { serviceId: id },
      });

      if (dto.steps.length > 0) {
        for (const step of dto.steps) {
          await this.createStep(id, step);
        }
      }
    }

    // Update detailed procedure
    if (dto.detailedProc !== undefined) {
      if (existing.detailedProc) {
        await this.prisma.detailedProc.update({
          where: { serviceId: id },
          data: {
            overview: dto.detailedProc.overview,
            overviewNepali: dto.detailedProc.overviewNepali,
            stepByStepGuide: dto.detailedProc.stepByStepGuide || [],
            importantNotes: dto.detailedProc.importantNotes || [],
            legalReferences: dto.detailedProc.legalReferences || [],
            faqs: dto.detailedProc.faqs || [],
            commonIssues: dto.detailedProc.commonIssues || [],
          },
        });
      } else {
        await this.prisma.detailedProc.create({
          data: {
            serviceId: id,
            overview: dto.detailedProc.overview,
            overviewNepali: dto.detailedProc.overviewNepali,
            stepByStepGuide: dto.detailedProc.stepByStepGuide || [],
            importantNotes: dto.detailedProc.importantNotes || [],
            legalReferences: dto.detailedProc.legalReferences || [],
            faqs: dto.detailedProc.faqs || [],
            commonIssues: dto.detailedProc.commonIssues || [],
          },
        });
      }
    }

    // Update metadata
    if (dto.metadata !== undefined) {
      if (existing.metadata) {
        await this.prisma.serviceMetadata.update({
          where: { serviceId: id },
          data: {
            version: dto.metadata.version,
            dataSource: dto.metadata.dataSource,
            verifiedBy: dto.metadata.verifiedBy,
          },
        });
      } else {
        await this.prisma.serviceMetadata.create({
          data: {
            serviceId: id,
            version: dto.metadata.version,
            dataSource: dto.metadata.dataSource,
            verifiedBy: dto.metadata.verifiedBy,
          },
        });
      }
    }

    // Update service
    const service = await this.prisma.service.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        categories: { include: { category: true } },
        serviceSteps: {
          include: {
            documentsRequired: true,
            totalFees: true,
            timeRequired: true,
            workingHours: true,
            responsibleAuthorities: true,
            complaintAuthorities: true,
          },
        },
        detailedProc: true,
        metadata: true,
      },
    });

    return {
      message: 'Service updated successfully',
      data: service,
    };
  }

  /**
   * Delete a service by ID
   */
  async delete(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        _count: { select: { children: true } },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    // Check if service has children
    if (service._count.children > 0) {
      throw new ConflictException(
        `Cannot delete service with ${service._count.children} child services. Delete children first.`
      );
    }

    await this.prisma.service.delete({
      where: { id },
    });

    return {
      message: 'Service deleted successfully',
      data: { id, name: service.name },
    };
  }

  /**
   * Get all categories for dropdown
   */
  async getCategories() {
    return this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get service stats for dashboard
   */
  async getStats() {
    const [totalServices, rootServices, leafServices, totalSteps] = await Promise.all([
      this.prisma.service.count(),
      this.prisma.service.count({ where: { parentId: null } }),
      this.prisma.service.count({
        where: {
          children: { none: {} },
        },
      }),
      this.prisma.serviceStep.count(),
    ]);

    return {
      totalServices,
      rootServices,
      leafServices,
      totalSteps,
    };
  }

  // Private helper methods
  private buildStepCreateData(step: CreateServiceStepDto): any {
    return {
      step: step.step,
      stepTitle: step.stepTitle,
      stepDescription: step.stepDescription,
      officeTypes: step.officeTypes as any || [],
      requiresAppointment: step.requiresAppointment || false,
      isOnline: step.isOnline || false,
      onlineFormUrl: step.onlineFormUrl,
      documentsRequired: step.documentsRequired ? {
        create: step.documentsRequired.map((doc) => ({
          docId: doc.docId,
          name: doc.name,
          nameNepali: doc.nameNepali,
          type: doc.type as any,
          quantity: doc.quantity,
          format: doc.format,
          isMandatory: doc.isMandatory ?? true,
          notes: doc.notes,
          relatedService: doc.relatedService,
          alternativeDocuments: doc.alternativeDocuments || [],
        })),
      } : undefined,
      totalFees: step.totalFees ? {
        create: step.totalFees.map((fee) => ({
          feeId: fee.feeId,
          feeTitle: fee.feeTitle,
          feeTitleNepali: fee.feeTitleNepali,
          feeAmount: fee.feeAmount,
          currency: fee.currency as any || 'NPR',
          feeType: fee.feeType as any,
          isRefundable: fee.isRefundable || false,
          applicableCondition: fee.applicableCondition,
          notes: fee.notes,
        })),
      } : undefined,
      timeRequired: step.timeRequired ? {
        create: {
          minimumTime: step.timeRequired.minimumTime,
          maximumTime: step.timeRequired.maximumTime,
          averageTime: step.timeRequired.averageTime,
          remarks: step.timeRequired.remarks,
          expeditedAvailable: step.timeRequired.expeditedAvailable || false,
          workingDaysOnly: step.timeRequired.workingDaysOnly ?? true,
        },
      } : undefined,
      workingHours: step.workingHours ? {
        create: step.workingHours.map((wh) => ({
          day: wh.day as any,
          openClose: wh.openClose,
        })),
      } : undefined,
      responsibleAuthorities: step.responsibleAuthorities ? {
        create: step.responsibleAuthorities.map((auth) => ({
          position: auth.position,
          positionNepali: auth.positionNepali,
          department: auth.department,
          contactNumber: auth.contactNumber,
          email: auth.email,
          complaintProcess: auth.complaintProcess,
          isResp: true,
        })),
      } : undefined,
      complaintAuthorities: step.complaintAuthorities ? {
        create: step.complaintAuthorities.map((auth) => ({
          position: auth.position,
          positionNepali: auth.positionNepali,
          department: auth.department,
          contactNumber: auth.contactNumber,
          email: auth.email,
          complaintProcess: auth.complaintProcess,
          isResp: false,
        })),
      } : undefined,
    };
  }

  private async createStep(serviceId: string, step: CreateServiceStepDto) {
    return this.prisma.serviceStep.create({
      data: {
        serviceId,
        ...this.buildStepCreateData(step),
      },
    });
  }
}
