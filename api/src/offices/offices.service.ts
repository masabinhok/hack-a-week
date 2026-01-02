import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { 
  FindOfficesByLocationDto, 
  FindOfficesByTypeDto, 
  SearchOfficesDto, 
  OfficeType 
} from './dtos';
import { LocationCodeUtil } from '../common/utils/location-code.util';

@Injectable()
export class OfficesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all offices in a location with their details
   * Uses either explicit IDs or location code
   */
  async findByLocation(dto: FindOfficesByLocationDto) {
    let { provinceId, districtId, municipalityId, wardId, locationCode } = dto;

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

    const offices = await this.prisma.office.findMany({
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
    });

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
      total: offices.length,
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
    let { officeType, provinceId, districtId, municipalityId, wardId, locationCode } = dto;

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

    const offices = await this.prisma.office.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });

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
      total: offices.length,
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
    const { q, type, limit = 20 } = dto;

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

    const offices = await this.prisma.office.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    return {
      offices: offices.map((o) => ({
        id: o.id,
        name: o.name,
        nameNepali: o.nameNepali,
        type: o.type,
        address: o.address,
        category: o.category?.name || null,
      })),
      total: offices.length,
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
}
