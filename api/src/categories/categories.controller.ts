import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * GET /api/v1/categories
   * Get all categories with service counts
   */
  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  /**
   * GET /api/v1/categories/:slug
   * Get a single category by slug
   */
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  /**
   * GET /api/v1/categories/:slug/services
   * Get services in a category
   */
  @Get(':slug/services')
  async findServicesByCategory(@Param('slug') slug: string) {
    return this.categoriesService.findServicesByCategory(slug);
  }
}
