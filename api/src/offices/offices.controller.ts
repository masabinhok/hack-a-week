import { Body, Controller, Get, Param } from '@nestjs/common';
import { OfficesService } from './offices.service';
import { OfficesByLocationDto } from './dtos/offices-by-location.dto';
import { OfficeType } from 'src/generated/prisma/enums';

@Controller('offices')
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  @Get('nearby/:officeType')
  async getSpecificOfficesNearby(
    @Param('officeType') officeType: string,
    @Body() officesByLocationDto: OfficesByLocationDto 
  ){
    const trimmedOfficeType = officeType.trim() as OfficeType;
    return this.officesService.getSpecificOfficesNearby(trimmedOfficeType, officesByLocationDto);
  }
}
