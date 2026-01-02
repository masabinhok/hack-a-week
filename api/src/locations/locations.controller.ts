import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('provinces')
  async findAllProvinces(){
    return this.locationsService.findAllProvinces();
  }

  @Get('provinces/:provinceId/districts')
  async findDistrictsByProvince(@Param('provinceId', ParseIntPipe) provinceId: number) {
    return this.locationsService.findDistrictsByProvince(provinceId);
  }

  @Get('districts/:districtId/municipalities')
  async findMunicipalitiesByDistrict(@Param('districtId', ParseIntPipe) districtId: number) {
    return this.locationsService.findMunicipalitiesByDistrict(districtId);
  }

  @Get('municipalities/:municipalityId/wards')
  async findWardsByMunicipality(@Param('municipalityId', ParseIntPipe) municipalityId: number) {
    return this.locationsService.findWardsByMunicipality(municipalityId);
  }
}
