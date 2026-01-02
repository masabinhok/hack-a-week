import { Body, Controller, Get, Param } from '@nestjs/common';
import { OfficesService } from './offices.service';
import { OfficesByLocationDto } from './dtos/offices-by-location.dto';
import { OfficeType } from 'src/generated/prisma/enums';

@Controller('offices')
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  @Get('nearby/:officeType')
  async getSpecificOfficesNearby(
    @Param('officeType') officeType: OfficeType,
    @Body() officesByLocationDto: OfficesByLocationDto 
  ){
    return this.officesService.getSpecificOfficesNearby(officeType, officesByLocationDto);
  }
}
