import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserLocationsDto } from './dto/update-user-locations.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new user or return existing user by phone
   */
  async findOrCreate(createUserDto: CreateUserDto) {
    let user = await this.prisma.user.findUnique({
      where: { phone: createUserDto.phone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: createUserDto,
      });
    }

    return user;
  }

  /**
   * Get user by ID
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Get user by phone
   */
  async findByPhone(phone: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new NotFoundException(`User with phone ${phone} not found`);
    }

    return user;
  }

  /**
   * Update user locations
   */
  async updateLocations(id: string, updateDto: UpdateUserLocationsDto) {
    const user = await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: updateDto,
    });
  }

  /**
   * Get user locations with full details
   */
  async getLocationsWithDetails(id: string) {
    const user = await this.findOne(id);

    const [
      permanentProvince,
      permanentDistrict,
      permanentMunicipality,
      permanentWard,
      convenientProvince,
      convenientDistrict,
      convenientMunicipality,
      convenientWard,
    ] = await Promise.all([
      user.permanentProvinceId
        ? this.prisma.province.findUnique({
            where: { id: user.permanentProvinceId },
          })
        : null,
      user.permanentDistrictId
        ? this.prisma.district.findUnique({
            where: { id: user.permanentDistrictId },
          })
        : null,
      user.permanentMunicipalityId
        ? this.prisma.municipality.findUnique({
            where: { id: user.permanentMunicipalityId },
          })
        : null,
      user.permanentWardId
        ? this.prisma.ward.findUnique({
            where: { id: user.permanentWardId },
          })
        : null,
      user.convenientProvinceId
        ? this.prisma.province.findUnique({
            where: { id: user.convenientProvinceId },
          })
        : null,
      user.convenientDistrictId
        ? this.prisma.district.findUnique({
            where: { id: user.convenientDistrictId },
          })
        : null,
      user.convenientMunicipalityId
        ? this.prisma.municipality.findUnique({
            where: { id: user.convenientMunicipalityId },
          })
        : null,
      user.convenientWardId
        ? this.prisma.ward.findUnique({
            where: { id: user.convenientWardId },
          })
        : null,
    ]);

    return {
      ...user,
      permanent: {
        province: permanentProvince,
        district: permanentDistrict,
        municipality: permanentMunicipality,
        ward: permanentWard,
      },
      convenient: {
        province: convenientProvince,
        district: convenientDistrict,
        municipality: convenientMunicipality,
        ward: convenientWard,
      },
    };
  }
}
