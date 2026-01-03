import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Office, OfficeType as PrismaOfficeType } from 'src/generated/prisma/client'
import { 
  FindOfficesByLocationDto, 
  FindOfficesByTypeDto, 
  SearchOfficesDto, 
  FindOfficesForServiceDto,
  OfficeType 
} from './dtos';
import { LocationCodeUtil } from '../common/utils/location-code.util';

@Injectable()
export class OfficesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllOffices(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [offices, total] = await Promise.all([
      this.prisma.office.findMany({
        include: {
          category: true,
        },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.office.count(),
    ]);

    return {
      offices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all offices in a location with their details
   * Uses either explicit IDs or location code
   */
  async findByLocation(dto: FindOfficesByLocationDto) {
    let { provinceId, districtId, municipalityId, wardId, locationCode, page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    // Parse location code if provided
    if (locationCode) {
      const parsed = LocationCodeUtil.parse(locationCode);
      if (parsed) {
        provinceId = parsed.provinceId;
        districtId = parsed.districtId;
        municipalityId = parsed.municipalityId;
        wardId = parsed.wardId;
      } else {
        throw new BadRequestException(
          `Invalid location code format: ${locationCode}. Expected P-DD-MMM-WWWW`
        );
      }
    }

    if (!provinceId && !districtId && !municipalityId && !wardId) {
      throw new BadRequestException(
        'At least one location parameter is required: provinceId, districtId, municipalityId, wardId, or locationCode'
      );
    }

    // Build OR conditions for each jurisdiction level
    const orConditions: any[] = [];

    if (wardId) {
      orConditions.push({
        wardOffices: {
          some: { wardId },
        },
      });
    }

    if (municipalityId) {
      orConditions.push({
        municipalityOffices: {
          some: { municipalityId },
        },
      });
    }

    if (districtId) {
      orConditions.push({
        districtOffices: {
          some: { districtId },
        },
      });
    }

    if (provinceId) {
      orConditions.push({
        provinceOffices: {
          some: { provinceId },
        },
      });
    }

    const [offices, total] = await Promise.all([
      this.prisma.office.findMany({
        where: {
          OR: orConditions,
        },
        include: {
          category: true,
          _count: {
            select: {
              wardOffices: true,
              municipalityOffices: true,
              districtOffices: true,
              provinceOffices: true,
            },
          },
        },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.office.count({
        where: {
          OR: orConditions,
        },
      }),
    ]);

    return {
      offices: offices.map((o) => ({
        id: o.id,
        name: o.name,
        nameNepali: o.nameNepali,
        type: o.type,
        address: o.address,
        addressNepali: o.addressNepali,
        contact: o.contact,
        alternateContact: o.alternateContact,
        email: o.email,
        website: o.website,
        category: o.category
          ? {
              name: o.category.name,
              description: o.category.description,
            }
          : null,
        coverageCount: {
          wards: o._count.wardOffices,
          municipalities: o._count.municipalityOffices,
          districts: o._count.districtOffices,
          provinces: o._count.provinceOffices,
        },
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      query: {
        provinceId,
        districtId,
        municipalityId,
        wardId,
      },
    };
  }

  /**
   * Get offices of specific type near a location
   */
  async findByTypeAndLocation(dto: FindOfficesByTypeDto) {
    let { officeType, provinceId, districtId, municipalityId, wardId, locationCode, page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    // Parse location code if provided
    if (locationCode) {
      const parsed = LocationCodeUtil.parse(locationCode);
      if (parsed) {
        provinceId = parsed.provinceId;
        districtId = parsed.districtId;
        municipalityId = parsed.municipalityId;
        wardId = parsed.wardId;
      } else {
        throw new BadRequestException(
          `Invalid location code format: ${locationCode}. Expected P-DD-MMM-WWWW`
        );
      }
    }

    // Build OR conditions for hierarchical search
    const orConditions: any[] = [];

    // Search from most specific to most general
    if (wardId) {
      orConditions.push({
        wardOffices: {
          some: { wardId },
        },
      });
    }

    if (municipalityId) {
      orConditions.push({
        municipalityOffices: {
          some: { municipalityId },
        },
      });
    }

    if (districtId) {
      orConditions.push({
        districtOffices: {
          some: { districtId },
        },
      });
    }

    if (provinceId) {
      orConditions.push({
        provinceOffices: {
          some: { provinceId },
        },
      });
    }

    const whereClause: any = {
      type: officeType,
    };

    if (orConditions.length > 0) {
      whereClause.OR = orConditions;
    }

    const [offices, total] = await Promise.all([
      this.prisma.office.findMany({
        where: whereClause,
        include: {
          category: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.office.count({
        where: whereClause,
      }),
    ]);

    return {
      offices: offices.map((o) => ({
        id: o.id,
        name: o.name,
        nameNepali: o.nameNepali,
        type: o.type,
        address: o.address,
        addressNepali: o.addressNepali,
        contact: o.contact,
        alternateContact: o.alternateContact,
        email: o.email,
        website: o.website,
        category: o.category
          ? {
              name: o.category.name,
              description: o.category.description,
            }
          : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      query: {
        officeType,
        provinceId,
        districtId,
        municipalityId,
        wardId,
      },
    };
  }

  /**
   * Get single office by ID
   */
  async findById(id: string) {
    const office = await this.prisma.office.findUnique({
      where: { id },
      include: {
        category: true,
        wardOffices: {
          include: {
            ward: {
              include: {
                municipality: {
                  include: {
                    district: {
                      include: {
                        province: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        municipalityOffices: {
          include: {
            municipality: {
              include: {
                district: {
                  include: {
                    province: true,
                  },
                },
              },
            },
          },
        },
        districtOffices: {
          include: {
            district: {
              include: {
                province: true,
              },
            },
          },
        },
        provinceOffices: {
          include: {
            province: true,
          },
        },
      },
    });

    if (!office) {
      throw new NotFoundException(`Office '${id}' not found`);
    }

    // Build coverage summary
    const coverage = {
      wards: office.wardOffices.map((wo) => ({
        wardNumber: wo.ward.wardNumber,
        municipality: wo.ward.municipality.name,
        district: wo.ward.municipality.district.name,
        province: wo.ward.municipality.district.province.name,
      })),
      municipalities: office.municipalityOffices.map((mo) => ({
        name: mo.municipality.name,
        nameNepali: mo.municipality.nameNep,
        district: mo.municipality.district.name,
        province: mo.municipality.district.province.name,
      })),
      districts: office.districtOffices.map((dobj) => ({
        name: dobj.district.name,
        nameNepali: dobj.district.nameNep,
        province: dobj.district.province.name,
      })),
      provinces: office.provinceOffices.map((po) => ({
        name: po.province.name,
        nameNepali: po.province.nameNep,
      })),
    };

    return {
      id: office.id,
      name: office.name,
      nameNepali: office.nameNepali,
      type: office.type,
      address: office.address,
      addressNepali: office.addressNepali,
      contact: office.contact,
      alternateContact: office.alternateContact,
      email: office.email,
      website: office.website,
      category: office.category
        ? {
            name: office.category.name,
            description: office.category.description,
          }
        : null,
      coverage,
      coverageCount: {
        wards: office.wardOffices.length,
        municipalities: office.municipalityOffices.length,
        districts: office.districtOffices.length,
        provinces: office.provinceOffices.length,
      },
    };
  }

  /**
   * Search offices by name
   */
  async search(dto: SearchOfficesDto) {
    const { q, type, page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    if (!q || q.length < 2) {
      return {
        offices: [],
        total: 0,
        query: q,
      };
    }

    const whereClause: any = {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { nameNepali: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ],
    };

    if (type) {
      whereClause.type = type;
    }

    const [offices, total] = await Promise.all([
      this.prisma.office.findMany({
        where: whereClause,
        include: {
          category: true,
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.office.count({
        where: whereClause,
      }),
    ]);

    return {
      offices: offices.map((o) => ({
        id: o.id,
        name: o.name,
        nameNepali: o.nameNepali,
        type: o.type,
        address: o.address,
        category: o.category?.name || null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      query: q,
    };
  }

  /**
   * Get all office types with counts
   */
  async getOfficeTypes() {
    const counts = await this.prisma.office.groupBy({
      by: ['type'],
      _count: {
        type: true,
      },
      orderBy: {
        type: 'asc',
      },
    });

    return {
      types: counts.map((c) => ({
        type: c.type,
        count: c._count.type,
      })),
    };
  }

  /**
   * Get all office categories with counts
   */
  async getOfficeCategories() {
    const categories = await this.prisma.officeCategory.findMany({
      include: {
        _count: {
          select: {
            offices: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        officeCount: c._count.offices,
      })),
      total: categories.length,
    };
  }

  /**
   * Get offices relevant to a service's steps based on user location
   * Returns offices grouped by step number, matching the officeTypes required for each step
   */
  async findForService(slug: string, dto: FindOfficesForServiceDto) {
    const { wardId, municipalityId, districtId, provinceId } = dto;

    // Get service with its steps
    const service = await this.prisma.service.findFirst({
      where: { slug },
      include: {
        serviceSteps: {
          select: {
            id: true,
            step: true,
            officeTypes: true, // Changed from officeType to officeTypes
            isOnline: true,
            onlineFormUrl: true,
          },
          orderBy: { step: 'asc' },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service '${slug}' not found`);
    }

    if (service.serviceSteps.length === 0) {
      return [];
    }

    // Workaround for Prisma adapter-pg bug with enum arrays
    // Fetch officeTypes and isOnline separately using raw SQL
    const stepIds = service.serviceSteps.map(s => s.id);
    const stepDetailsResult = await this.prisma.$queryRaw<{ 
      id: string; 
      officeTypes: string[];
      isOnline: boolean;
      onlineFormUrl: string | null;
    }[]>`
      SELECT id, "officeTypes"::text[] as "officeTypes", "isOnline", "onlineFormUrl" 
      FROM "ServiceStep" 
      WHERE id = ANY(${stepIds})
    `;
    const stepDetailsMap = new Map(stepDetailsResult.map(r => [r.id, r]));

    // Filter out online steps when getting office types
    const allOfficeTypes = service.serviceSteps
      .filter(s => {
        const details = stepDetailsMap.get(s.id);
        return !details?.isOnline; // Only include non-online steps
      })
      .flatMap((s) => stepDetailsMap.get(s.id)?.officeTypes || []);
    const officeTypes = [...new Set(allOfficeTypes)] as PrismaOfficeType[];

    // Build location filter for offices (only if there are non-online steps)
    let offices: (Office & { category: { name: string; description: string | null } | null })[] = [];
    
    if (officeTypes.length > 0) {
      const locationFilter: any[] = [];
      if (wardId) {
        locationFilter.push({ wardOffices: { some: { wardId } } });
      }
      if (municipalityId) {
        locationFilter.push({ municipalityOffices: { some: { municipalityId } } });
      }
      if (districtId) {
        locationFilter.push({ districtOffices: { some: { districtId } } });
      }
      if (provinceId) {
        locationFilter.push({ provinceOffices: { some: { provinceId } } });
      }

      // Fetch all relevant offices
      offices = await this.prisma.office.findMany({
        where: {
          type: { in: officeTypes },
          ...(locationFilter.length > 0 ? { OR: locationFilter } : {}),
        },
        include: {
          category: true,
        },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
      }) as (Office & { category: { name: string; description: string | null } | null })[];
    }

    // Group offices by step
    const result = service.serviceSteps.map((step) => {
      const stepDetails = stepDetailsMap.get(step.id);
      const stepOfficeTypes = stepDetails?.officeTypes || [];
      const isOnline = stepDetails?.isOnline || false;
      const onlineFormUrl = stepDetails?.onlineFormUrl || null;

      return {
        stepNumber: step.step,
        officeTypes: stepOfficeTypes,
        isOnline,
        onlineFormUrl,
        offices: isOnline 
          ? [] // Return empty offices array for online steps
          : offices
              .filter((o) => stepOfficeTypes.includes(o.type)) // Match any of the office types
              .map((o) => ({
                id: o.id,
                officeId: o.officeId,
                name: o.name,
                nameNepali: o.nameNepali,
                type: o.type,
                address: o.address,
                addressNepali: o.addressNepali,
                contact: o.contact,
                email: o.email,
                website: o.website,
                category: o.category
                  ? { name: o.category.name, description: o.category.description }
                  : null,
              })),
      };
    });

    return result;
  }
}
