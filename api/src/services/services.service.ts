import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all root services (level 0)
   * Returns services with children count
   */
  async findAllRootServices() {
    const services = await this.prisma.service.findMany({
      where: { 
        parentId: null,
        level: 0,
      },
      select: {
        id: true,
        serviceId: true,
        name: true,
        slug: true,
        description: true,
        priority: true,
        isOnlineEnabled: true,
        _count: {
          select: {
            children: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      services: services.map((s) => ({
        id: s.id,
        serviceId: s.serviceId,
        name: s.name,
        slug: s.slug,
        description: s.description,
        priority: s.priority,
        isOnlineEnabled: s.isOnlineEnabled,
        childrenCount: s._count.children,
        categories: s.categories.map((c) => ({
          name: c.category.name,
          slug: c.category.slug,
        })),
      })),
      total: services.length,
    };
  }

  /**
   * Get service by slug with immediate children
   * For parent services: returns children list
   * For leaf services: returns basic info (use /guide for full details)
   */
  async findBySlug(slug: string) {
    const service = await this.prisma.service.findFirst({
      where: { slug },
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
            description: true,
            priority: true,
            level: true,
            isOnlineEnabled: true,
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
          select: {
            category: {
              select: {
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
        metadata: true,
      },
    });

    if (!service) {
      throw new NotFoundException(`Service '${slug}' not found`);
    }

    const isLeaf = service._count.children === 0;
    const hasSteps = service._count.serviceSteps > 0;

    return {
      id: service.id,
      serviceId: service.serviceId,
      name: service.name,
      slug: service.slug,
      description: service.description,
      priority: service.priority,
      level: service.level,
      isOnlineEnabled: service.isOnlineEnabled,
      onlinePortalUrl: service.onlinePortalUrl,
      eligibility: service.eligibility,
      validityPeriod: service.validityPeriod,
      isLeaf,
      hasSteps,
      childrenCount: service._count.children,
      stepsCount: service._count.serviceSteps,
      parent: service.parent,
      children: service.children.map((c) => ({
        id: c.id,
        serviceId: c.serviceId,
        name: c.name,
        slug: c.slug,
        description: c.description,
        priority: c.priority,
        level: c.level,
        isOnlineEnabled: c.isOnlineEnabled,
        childrenCount: c._count.children,
        hasSteps: c._count.serviceSteps > 0,
      })),
      categories: service.categories.map((c) => ({
        name: c.category.name,
        slug: c.category.slug,
      })),
      metadata: service.metadata,
    };
  }

  /**
   * Get full guide for a leaf service
   * Returns all steps, documents, fees, time requirements, etc.
   */
  async findGuideBySlug(slug: string) {
    const service = await this.prisma.service.findFirst({
      where: { slug },
      include: {
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
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service '${slug}' not found`);
    }

    // Only leaf services have guides
    if (service._count.children > 0) {
      throw new NotFoundException(
        `Service '${slug}' is a parent service. Use /services/${slug} to see children, or navigate to a leaf service for the guide.`
      );
    }

    if (service.serviceSteps.length === 0) {
      throw new NotFoundException(
        `Service '${slug}' does not have a guide yet. It may be a placeholder service.`
      );
    }

    // Get breadcrumb
    const breadcrumb = await this.getBreadcrumb(service.id);

    return {
      id: service.id,
      serviceId: service.serviceId,
      name: service.name,
      slug: service.slug,
      description: service.description,
      priority: service.priority,
      isOnlineEnabled: service.isOnlineEnabled,
      onlinePortalUrl: service.onlinePortalUrl,
      eligibility: service.eligibility,
      validityPeriod: service.validityPeriod,
      breadcrumb,
      steps: service.serviceSteps.map((step) => ({
        step: step.step,
        stepTitle: step.stepTitle,
        stepDescription: step.stepDescription,
        officeType: step.officeType,
        requiresAppointment: step.requiresAppointment,
        documents: step.documentsRequired.map((doc) => ({
          name: doc.name,
          nameNepali: doc.nameNepali,
          type: doc.type,
          quantity: doc.quantity,
          format: doc.format,
          isMandatory: doc.isMandatory,
          notes: doc.notes,
          alternativeDocuments: doc.alternativeDocuments,
        })),
        fees: step.totalFees.map((fee) => ({
          feeTitle: fee.feeTitle,
          feeTitleNepali: fee.feeTitleNepali,
          feeAmount: fee.feeAmount,
          currency: fee.currency,
          feeType: fee.feeType,
          isRefundable: fee.isRefundable,
          applicableCondition: fee.applicableCondition,
          notes: fee.notes,
        })),
        timeRequired: step.timeRequired
          ? {
              minimumTime: step.timeRequired.minimumTime,
              maximumTime: step.timeRequired.maximumTime,
              averageTime: step.timeRequired.averageTime,
              remarks: step.timeRequired.remarks,
              expeditedAvailable: step.timeRequired.expeditedAvailable,
            }
          : null,
        workingHours: step.workingHours.map((wh) => ({
          day: wh.day,
          openClose: wh.openClose,
        })),
        responsibleAuthority: step.responsibleAuthorities[0]
          ? {
              position: step.responsibleAuthorities[0].position,
              positionNepali: step.responsibleAuthorities[0].positionNepali,
              department: step.responsibleAuthorities[0].department,
              contactNumber: step.responsibleAuthorities[0].contactNumber,
              email: step.responsibleAuthorities[0].email,
            }
          : null,
        complaintAuthority: step.complaintAuthorities[0]
          ? {
              position: step.complaintAuthorities[0].position,
              positionNepali: step.complaintAuthorities[0].positionNepali,
              department: step.complaintAuthorities[0].department,
              contactNumber: step.complaintAuthorities[0].contactNumber,
              email: step.complaintAuthorities[0].email,
              complaintProcess: step.complaintAuthorities[0].complaintProcess,
            }
          : null,
      })),
      detailedProcedure: service.detailedProc
        ? {
            overview: service.detailedProc.overview,
            overviewNepali: service.detailedProc.overviewNepali,
            stepByStepGuide: service.detailedProc.stepByStepGuide,
            importantNotes: service.detailedProc.importantNotes,
            legalReferences: service.detailedProc.legalReferences,
            faqs: service.detailedProc.faqs,
            commonIssues: service.detailedProc.commonIssues,
          }
        : null,
      metadata: service.metadata,
    };
  }

  /**
   * Get breadcrumb trail for a service
   */
  async findBreadcrumbBySlug(slug: string) {
    const service = await this.prisma.service.findFirst({
      where: { slug },
      select: { id: true },
    });

    if (!service) {
      throw new NotFoundException(`Service '${slug}' not found`);
    }

    return {
      breadcrumb: await this.getBreadcrumb(service.id),
    };
  }

  /**
   * Helper: Build breadcrumb trail by traversing parent chain
   */
  private async getBreadcrumb(
    serviceId: string
  ): Promise<{ name: string; slug: string }[]> {
    const breadcrumb: { name: string; slug: string }[] = [];
    let currentId: string | null = serviceId;

    while (currentId) {
      const service = await this.prisma.service.findUnique({
        where: { id: currentId },
        select: {
          name: true,
          slug: true,
          parentId: true,
        },
      });

      if (!service) break;

      breadcrumb.unshift({
        name: service.name,
        slug: service.slug,
      });

      currentId = service.parentId;
    }

    return breadcrumb;
  }

  /**
   * Search services by keyword
   */
  async searchServices(query: string) {
    if (!query || query.trim().length < 2) {
      return {
        services: [],
        total: 0,
        query,
      };
    }

    const searchTerm = query.trim().toLowerCase();

    const services = await this.prisma.service.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { slug: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        serviceId: true,
        name: true,
        slug: true,
        description: true,
        priority: true,
        level: true,
        isOnlineEnabled: true,
        _count: {
          select: {
            children: true,
            serviceSteps: true,
          },
        },
      },
      take: 20,
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    });

    return {
      services: services.map((s) => ({
        id: s.id,
        serviceId: s.serviceId,
        name: s.name,
        slug: s.slug,
        description: s.description,
        priority: s.priority,
        level: s.level,
        isOnlineEnabled: s.isOnlineEnabled,
        isLeaf: s._count.children === 0,
        hasSteps: s._count.serviceSteps > 0,
      })),
      total: services.length,
      query,
    };
  }
}
