import { Injectable } from '@nestjs/common';
import { Office, OfficeType } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { OfficesByLocationDto } from './dtos/offices-by-location.dto';

@Injectable()
export class OfficesService {
    constructor(private readonly prisma: PrismaService) {}

    async getSpecificOfficesNearby(officeType: OfficeType, officesByLocationDto: OfficesByLocationDto) {
        const { provinceId, districtId, municipalityId, wardId } = officesByLocationDto;

        return this.prisma.office.findMany({
            where: {
                type: officeType,
                OR: [
                    {
                        wardOffices: {
                            some: {
                                wardId
                            }
                        }
                    },
                    {
                        municipalityOffices: {
                            some: {
                                municipalityId
                            }
                        }
                    },
                    {
                        districtOffices: {
                            some: {
                                districtId
                            }
                        }
                    },
                    {
                        provinceOffices: {
                            some: {
                                provinceId
                            }
                        }
                    },
                ]

            }
        })
    }


}
