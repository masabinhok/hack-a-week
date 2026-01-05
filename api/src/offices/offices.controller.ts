import { Controller, Get, Param, Query } from '@nestjs/common';
import { OfficesService } from './offices.service';
import {
  FindOfficesByLocationDto,
  FindOfficesByCategoryDto,
  SearchOfficesDto,
  FindOfficesForServiceDto,
  PaginationDto,
} from './dtos';

@Controller({
  path: 'offices',
  version: '1',
})
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  @Get()
  getAllOffices(@Query() dto: PaginationDto) {
    return this.officesService.getAllOffices(dto.page, dto.limit);
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
   * GET /api/v1/offices/search?q=keyword&categoryId=...&limit=20
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
   * GET /api/v1/offices/by-category?categoryId=...&provinceId=1&districtId=27
   * GET /api/v1/offices/by-category?categoryId=...&locationCode=1-27-001
   * Get offices of specific category near a location
   */
  @Get('by-category')
  findByCategory(@Query() dto: FindOfficesByCategoryDto) {
    return this.officesService.findByCategoryAndLocation(dto);
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
