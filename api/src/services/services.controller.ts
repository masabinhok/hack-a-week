import { Controller, Get, Param, Query } from '@nestjs/common';
import { ServicesService } from './services.service.new';

@Controller({
  path: 'services',
  version: '1',
})
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * GET /api/v1/services
   * Get all root (parent) services
   */
  @Get()
  findAll() {
    return this.servicesService.findAllRootServices();
  }

  /**
   * GET /api/v1/services/search?q=keyword
   * Search services by keyword
   */
  @Get('search')
  search(@Query('q') query: string) {
    return this.servicesService.searchServices(query);
  }

  /**
   * GET /api/v1/services/:slug
   * Get service details by slug, including children
   */
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.servicesService.findBySlug(slug);
  }

  /**
   * GET /api/v1/services/:slug/guide
   * Get full guide for leaf service (steps, documents, fees, etc.)
   */
  @Get(':slug/guide')
  findGuide(@Param('slug') slug: string) {
    return this.servicesService.findGuideBySlug(slug);
  }

  /**
   * GET /api/v1/services/:slug/breadcrumb
   * Get breadcrumb trail for navigation
   */
  @Get(':slug/breadcrumb')
  findBreadcrumb(@Param('slug') slug: string) {
    return this.servicesService.findBreadcrumbBySlug(slug);
  }
}
