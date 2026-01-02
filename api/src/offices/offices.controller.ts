import { Controller, Get, Param, Query } from '@nestjs/common';
import { OfficesService } from './offices.service';
import {
  FindOfficesByLocationDto,
  FindOfficesByTypeDto,
  SearchOfficesDto,
  FindOfficesForServiceDto,
} from './dtos';

@Controller({
  path: 'offices',
  version: '1',
})
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  /**
   * GET /api/v1/offices/types
   * Get all office types with counts
   */
  @Get('types')
  getOfficeTypes() {
    return this.officesService.getOfficeTypes();
  }

  /**
   * GET /api/v1/offices/categories
   * Get all office categories with counts
   */
  @Get('categories')
  getOfficeCategories() {
    return this.officesService.getOfficeCategories();
  }

  /**
   * GET /api/v1/offices/search?q=keyword&type=WARD&limit=20
   * Search offices by name
   */
  @Get('search')
  search(@Query() dto: SearchOfficesDto) {
    return this.officesService.search(dto);
  }

  /**
   * GET /api/v1/offices/by-location?provinceId=1&districtId=27&municipalityId=1
   * GET /api/v1/offices/by-location?locationCode=1-27-001-0005
   * Get all offices in a location
   */
  @Get('by-location')
  findByLocation(@Query() dto: FindOfficesByLocationDto) {
    return this.officesService.findByLocation(dto);
  }

  /**
   * GET /api/v1/offices/by-type?officeType=WARD&provinceId=1&districtId=27
   * GET /api/v1/offices/by-type?officeType=PASSPORT&locationCode=1-27-001
   * Get offices of specific type near a location
   */
  @Get('by-type')
  findByType(@Query() dto: FindOfficesByTypeDto) {
    return this.officesService.findByTypeAndLocation(dto);
  }

  /**
   * GET /api/v1/offices/for-service/:slug?wardId=1&municipalityId=2&districtId=3
   * Get offices relevant to a service's steps based on location
   */
  @Get('for-service/:slug')
  findForService(
    @Param('slug') slug: string,
    @Query() dto: FindOfficesForServiceDto
  ) {
    return this.officesService.findForService(slug, dto);
  }

  /**
   * GET /api/v1/offices/:id
   * Get single office details
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.officesService.findById(id);
  }
}
