import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LocationsService {
    constructor( private readonly prisma: PrismaService){}
    // 1. Get all provinces
    async findAllProvinces() {
        const provinces = await this.prisma.province.findMany({
        select: {
            id: true,
            name: true,
            nameNep: true,
            slug: true,
        },
        orderBy: { id: 'asc' }
        });

        return { provinces };
    }

    // 2. Get districts by province
    async findDistrictsByProvince(provinceId: number) {
        const province = await this.prisma.province.findUnique({
        where: { id: provinceId },
        select: {
            id: true,
            name: true,
            nameNep: true,
        }
        });

        if (!province) {
        throw new NotFoundException(`Province with ID ${provinceId} not found`);
        }

        const districts = await this.prisma.district.findMany({
        where: { provinceId },
        select: {
            id: true,
            name: true,
            nameNep: true,
            slug: true,
            provinceId: true,
        },
        orderBy: { name: 'asc' }
        });

        return {
        province,
        districts
        };
    }

    // 3. Get municipalities by district
    async findMunicipalitiesByDistrict(districtId: number) {
        const district = await this.prisma.district.findUnique({
        where: { id: districtId },
        select: {
            id: true,
            name: true,
            nameNep: true,
            province: {
            select: {
                name: true
            }
            }
        }
        });

        if (!district) {
        throw new NotFoundException(`District with ID ${districtId} not found`);
        }

        const municipalities = await this.prisma.municipality.findMany({
        where: { districtId },
        select: {
            id: true,
            name: true,
            nameNep: true,
            slug: true,
            type: true,
            districtId: true,
            _count: {
            select: { wards: true }
            }
        },
        orderBy: { name: 'asc' }
        });

        // Add wardCount to each municipality
        const municipalitiesWithWardCount = municipalities.map(m => ({
        id: m.id,
        name: m.name,
        nameNep: m.nameNep,
        slug: m.slug,
        type: m.type,
        districtId: m.districtId,
        wardCount: m._count.wards
        }));

        return {
        district,
        municipalities: municipalitiesWithWardCount
        };
    }

    // 4. Get wards by municipality
    async findWardsByMunicipality(municipalityId: number) {
        const municipality = await this.prisma.municipality.findUnique({
        where: { id: municipalityId },
        select: {
            id: true,
            name: true,
            nameNep: true,
            district: {
            select: {
                name: true,
                province: {
                select: { name: true }
                }
            }
            }
        }
        });

        if (!municipality) {
        throw new NotFoundException(`Municipality with ID ${municipalityId} not found`);
        }

        const wards = await this.prisma.ward.findMany({
        where: { municipalityId },
        select: {
            id: true,
            wardNumber: true,
            municipalityId: true,
        },
        orderBy: { wardNumber: 'asc' }
        });

        return {
        municipality,
        wards
        };
    }
}