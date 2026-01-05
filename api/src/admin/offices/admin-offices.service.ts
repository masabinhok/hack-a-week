import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOfficeDto, UpdateOfficeDto, AdminOfficeQueryDto } from '../dto/create-office.dto';
import { EmailService } from '../../common/services/email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AdminOfficesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Get all offices with pagination and filters
   */
  async findAll(params: AdminOfficeQueryDto) {
    const { page = 1, limit = 20, search, type, categoryId, isActive, provinceId, districtId, municipalityId, wardId } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Enhanced search - search through office fields AND location names
    if (search) {
      const searchTerms = search.toLowerCase().split(/\s+/).filter(Boolean);
      
      // Build search conditions for each term
      where.AND = searchTerms.map(term => ({
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { nameNepali: { contains: term, mode: 'insensitive' } },
          { officeId: { contains: term, mode: 'insensitive' } },
          { address: { contains: term, mode: 'insensitive' } },
          { addressNepali: { contains: term, mode: 'insensitive' } },
          // Search through ward offices
          {
            wardOffices: {
              some: {
                ward: {
                  OR: [
                    { wardNumber: isNaN(parseInt(term)) ? undefined : parseInt(term) },
                    {
                      municipality: {
                        OR: [
                          { name: { contains: term, mode: 'insensitive' } },
                          { nameNep: { contains: term, mode: 'insensitive' } },
                          {
                            district: {
                              OR: [
                                { name: { contains: term, mode: 'insensitive' } },
                                { nameNep: { contains: term, mode: 'insensitive' } },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
          // Search through municipality offices
          {
            municipalityOffices: {
              some: {
                municipality: {
                  OR: [
                    { name: { contains: term, mode: 'insensitive' } },
                    { nameNep: { contains: term, mode: 'insensitive' } },
                    {
                      district: {
                        OR: [
                          { name: { contains: term, mode: 'insensitive' } },
                          { nameNep: { contains: term, mode: 'insensitive' } },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
          // Search through district offices
          {
            districtOffices: {
              some: {
                district: {
                  OR: [
                    { name: { contains: term, mode: 'insensitive' } },
                    { nameNep: { contains: term, mode: 'insensitive' } },
                  ],
                },
              },
            },
          },
          // Search through province offices
          {
            provinceOffices: {
              some: {
                province: {
                  OR: [
                    { name: { contains: term, mode: 'insensitive' } },
                    { nameNep: { contains: term, mode: 'insensitive' } },
                  ],
                },
              },
            },
          },
        ],
      }));
    }

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Location filters
    if (wardId) {
      where.wardOffices = { some: { wardId } };
    } else if (municipalityId) {
      where.OR = [
        { wardOffices: { some: { ward: { municipalityId } } } },
        { municipalityOffices: { some: { municipalityId } } },
      ];
    } else if (districtId) {
      where.OR = [
        { wardOffices: { some: { ward: { municipality: { districtId } } } } },
        { municipalityOffices: { some: { municipality: { districtId } } } },
        { districtOffices: { some: { districtId } } },
      ];
    } else if (provinceId) {
      where.OR = [
        { wardOffices: { some: { ward: { municipality: { district: { provinceId } } } } } },
        { municipalityOffices: { some: { municipality: { district: { provinceId } } } } },
        { districtOffices: { some: { district: { provinceId } } } },
        { provinceOffices: { some: { provinceId } } },
      ];
    }

    const [offices, total] = await Promise.all([
      this.prisma.office.findMany({
        where,
        skip,
        take: limit,
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
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.office.count({ where }),
    ]);

    // Transform location data for easier use
    const transformedOffices = offices.map((office) => ({
      ...office,
      location: this.extractLocation(office),
    }));

    return {
      data: transformedOffices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get office(s) managed by a specific office admin
   */
  async findByOfficeAdmin(userId: string) {
    const office = await this.prisma.office.findFirst({
      where: { officeAdminId: userId },
      include: {
        category: true,
        ratings: true,
        officeAdmin: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
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
      throw new NotFoundException('No office found for this admin user');
    }

    return {
      data: [{
        ...office,
        location: this.extractLocation(office),
      }],
      meta: {
        total: 1,
        page: 1,
        limit: 1,
        totalPages: 1,
      },
    };
  }

  /**
   * Get a single office by ID with all details
   */
  async findOne(id: string) {
    const office = await this.prisma.office.findUnique({
      where: { id },
      include: {
        category: true,
        ratings: true,
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
      throw new NotFoundException(`Office with ID ${id} not found`);
    }

    return {
      ...office,
      location: this.extractLocation(office),
    };
  }

  /**
   * Get statistics for dashboard
   */
  async getStats() {
    const [
      totalOffices,
      activeOffices,
      officesByType,
      officesByCategory,
    ] = await Promise.all([
      this.prisma.office.count(),
      this.prisma.office.count({ where: { isActive: true } }),
      this.prisma.office.groupBy({
        by: ['type'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      this.prisma.office.groupBy({
        by: ['categoryId'],
        _count: { id: true },
      }),
    ]);

    // Get category names
    const categoryIds = officesByCategory.map((c) => c.categoryId);
    const categories = await this.prisma.officeCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    return {
      totalOffices,
      activeOffices,
      inactiveOffices: totalOffices - activeOffices,
      byType: officesByType.map((t) => ({
        type: t.type,
        count: t._count.id,
      })),
      byCategory: officesByCategory.map((c) => ({
        categoryId: c.categoryId,
        categoryName: categoryMap.get(c.categoryId) || 'Unknown',
        count: c._count.id,
      })),
    };
  }

  /**
   * Get all office categories for dropdown
   */
  async getCategories() {
    return this.prisma.officeCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create a new office with auto-generated office admin credentials
   */
  async create(dto: CreateOfficeDto) {
    // Check if officeId already exists
    const existing = await this.prisma.office.findUnique({
      where: { officeId: dto.officeId },
    });

    if (existing) {
      throw new ConflictException(`Office with ID "${dto.officeId}" already exists`);
    }

    // Verify category exists
    const category = await this.prisma.officeCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException(`Category with ID "${dto.categoryId}" not found`);
    }

    const { location, ...officeData } = dto;

    // Generate office admin credentials
    const generatedUsername = this.generateOfficeAdminUsername(dto.officeId);
    const generatedPassword = this.generateSecurePassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create office, office admin user, and location assignments in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the office admin user
      const officeAdmin = await tx.user.create({
        data: {
          username: generatedUsername,
          passwordHash: hashedPassword,
          role: 'OFFICE_ADMIN',
          isActive: true,
          fullName: `Admin - ${dto.name}`,
        },
      });

      // Create the office with the office admin linked
      const newOffice = await tx.office.create({
        data: {
          ...officeData,
          photoUrls: officeData.photoUrls || [],
          facilities: officeData.facilities || [],
          officeAdminId: officeAdmin.id,
        },
        include: {
          category: true,
          officeAdmin: {
            select: {
              id: true,
              username: true,
              fullName: true,
              role: true,
            },
          },
        },
      });

      // Create location assignments based on the provided location
      if (location) {
        if (location.wardId) {
          await tx.wardOffice.create({
            data: {
              officeId: newOffice.id,
              wardId: location.wardId,
            },
          });
        }

        if (location.municipalityId) {
          await tx.municipalityOffice.create({
            data: {
              officeId: newOffice.id,
              municipalityId: location.municipalityId,
            },
          });
        }

        if (location.districtId) {
          await tx.districtOffice.create({
            data: {
              officeId: newOffice.id,
              districtId: location.districtId,
            },
          });
        }

        if (location.provinceId) {
          await tx.provinceOffice.create({
            data: {
              officeId: newOffice.id,
              provinceId: location.provinceId,
            },
          });
        }
      }

      return {
        office: newOffice,
        officeAdminCredentials: {
          username: generatedUsername,
          password: generatedPassword, // Only returned once during creation
        },
      };
    });

    // Send credentials email to office email
    const emailSent = await this.emailService.sendOfficeCredentialsEmail({
      officeName: dto.name,
      officeEmail: dto.email,
      username: result.officeAdminCredentials.username,
      password: result.officeAdminCredentials.password,
    });

    return {
      message: emailSent 
        ? 'Office created successfully. Admin credentials have been sent to the office email.'
        : 'Office created successfully. Admin credentials email could not be sent - please note them down.',
      data: result.office,
      officeAdminCredentials: result.officeAdminCredentials,
      emailSent,
    };
  }

  /**
   * Generate a username for office admin based on office ID
   */
  private generateOfficeAdminUsername(officeId: string): string {
    // Clean the office ID to make it username-friendly
    const cleanId = officeId.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `office_${cleanId}`;
  }

  /**
   * Generate a secure random password
   */
  private generateSecurePassword(length: number = 12): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    const bytes = crypto.randomBytes(length);
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars[bytes[i] % chars.length];
    }
    return password;
  }

  /**
   * Reset office admin password (admin only)
   */
  async resetOfficeAdminPassword(officeId: string) {
    const office = await this.prisma.office.findUnique({
      where: { id: officeId },
      include: {
        officeAdmin: {
          select: { id: true, username: true },
        },
      },
    });

    if (!office) {
      throw new NotFoundException(`Office with ID ${officeId} not found`);
    }

    if (!office.officeAdmin) {
      throw new BadRequestException('This office does not have an assigned office admin');
    }

    const newPassword = this.generateSecurePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: office.officeAdmin.id },
      data: { passwordHash: hashedPassword },
    });

    // Send new credentials via email if office has email
    let emailSent = false;
    if (office.email) {
      emailSent = await this.emailService.sendOfficeCredentialsEmail({
        officeName: office.name,
        officeEmail: office.email,
        username: office.officeAdmin.username!,
        password: newPassword,
      });
    }

    return {
      message: emailSent 
        ? 'Office admin password reset successfully. New credentials have been sent to the office email.'
        : 'Office admin password reset successfully. Please share the new credentials securely.',
      credentials: {
        username: office.officeAdmin.username,
        password: newPassword,
      },
      emailSent,
    };
  }

  /**
   * Update an existing office
   */
  async update(id: string, dto: UpdateOfficeDto) {
    // Check if office exists
    const existing = await this.prisma.office.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Office with ID ${id} not found`);
    }

    // Check if new officeId conflicts with another office
    if (dto.officeId && dto.officeId !== existing.officeId) {
      const conflicting = await this.prisma.office.findUnique({
        where: { officeId: dto.officeId },
      });

      if (conflicting) {
        throw new ConflictException(`Office with ID "${dto.officeId}" already exists`);
      }
    }

    // Verify category if being updated
    if (dto.categoryId) {
      const category = await this.prisma.officeCategory.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new BadRequestException(`Category with ID "${dto.categoryId}" not found`);
      }
    }

    const { location, ...officeData } = dto;

    // Update office and location assignments in a transaction
    const office = await this.prisma.$transaction(async (tx) => {
      // Update the office
      const updatedOffice = await tx.office.update({
        where: { id },
        data: officeData,
        include: {
          category: true,
        },
      });

      // Update location assignments if provided
      if (location) {
        // Remove existing location assignments
        await tx.wardOffice.deleteMany({ where: { officeId: id } });
        await tx.municipalityOffice.deleteMany({ where: { officeId: id } });
        await tx.districtOffice.deleteMany({ where: { officeId: id } });
        await tx.provinceOffice.deleteMany({ where: { officeId: id } });

        // Create new location assignments
        if (location.wardId) {
          await tx.wardOffice.create({
            data: {
              officeId: id,
              wardId: location.wardId,
            },
          });
        }

        if (location.municipalityId) {
          await tx.municipalityOffice.create({
            data: {
              officeId: id,
              municipalityId: location.municipalityId,
            },
          });
        }

        if (location.districtId) {
          await tx.districtOffice.create({
            data: {
              officeId: id,
              districtId: location.districtId,
            },
          });
        }

        if (location.provinceId) {
          await tx.provinceOffice.create({
            data: {
              officeId: id,
              provinceId: location.provinceId,
            },
          });
        }
      }

      return updatedOffice;
    });

    return {
      message: 'Office updated successfully',
      data: office,
    };
  }

  /**
   * Delete an office
   */
  async delete(id: string) {
    const existing = await this.prisma.office.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Office with ID ${id} not found`);
    }

    await this.prisma.office.delete({
      where: { id },
    });

    return {
      message: 'Office deleted successfully',
    };
  }

  /**
   * Helper: Extract location details from office relations
   */
  private extractLocation(office: any) {
    // Try to get the most specific location first
    if (office.wardOffices?.[0]) {
      const ward = office.wardOffices[0].ward;
      return {
        wardId: ward.id,
        wardNumber: ward.wardNumber,
        municipalityId: ward.municipality.id,
        municipalityName: ward.municipality.name,
        districtId: ward.municipality.district.id,
        districtName: ward.municipality.district.name,
        provinceId: ward.municipality.district.province.id,
        provinceName: ward.municipality.district.province.name,
        level: 'ward',
      };
    }

    if (office.municipalityOffices?.[0]) {
      const municipality = office.municipalityOffices[0].municipality;
      return {
        municipalityId: municipality.id,
        municipalityName: municipality.name,
        districtId: municipality.district.id,
        districtName: municipality.district.name,
        provinceId: municipality.district.province.id,
        provinceName: municipality.district.province.name,
        level: 'municipality',
      };
    }

    if (office.districtOffices?.[0]) {
      const district = office.districtOffices[0].district;
      return {
        districtId: district.id,
        districtName: district.name,
        provinceId: district.province.id,
        provinceName: district.province.name,
        level: 'district',
      };
    }

    if (office.provinceOffices?.[0]) {
      const province = office.provinceOffices[0].province;
      return {
        provinceId: province.id,
        provinceName: province.name,
        level: 'province',
      };
    }

    return null;
  }
}
