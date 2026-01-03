import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminServicesService } from './admin-services.service';
import { CreateServiceDto, UpdateServiceDto } from '../dto/create-service.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('admin/services')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminServicesController {
  constructor(private readonly adminServicesService: AdminServicesService) {}

  /**
   * GET /admin/services
   * Get all services with pagination and search
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('parentId') parentId?: string,
  ) {
    return this.adminServicesService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
      parentId: parentId === 'null' ? null : parentId,
    });
  }

  /**
   * GET /admin/services/stats
   * Get service statistics for dashboard
   */
  @Get('stats')
  async getStats() {
    return this.adminServicesService.getStats();
  }

  /**
   * GET /admin/services/categories
   * Get all categories for dropdown selection
   */
  @Get('categories')
  async getCategories() {
    return this.adminServicesService.getCategories();
  }

  /**
   * GET /admin/services/:id
   * Get a single service by ID with all details
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.adminServicesService.findOne(id);
  }

  /**
   * POST /admin/services
   * Create a new service with nested relations
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateServiceDto, @GetUser() user: any) {
    const result = await this.adminServicesService.create(dto);
    return {
      ...result,
      createdBy: user?.username,
    };
  }

  /**
   * PUT /admin/services/:id
   * Update an existing service
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @GetUser() user: any,
  ) {
    const result = await this.adminServicesService.update(id, dto);
    return {
      ...result,
      updatedBy: user?.username,
    };
  }

  /**
   * DELETE /admin/services/:id
   * Delete a service
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @GetUser() user: any) {
    const result = await this.adminServicesService.delete(id);
    return {
      ...result,
      deletedBy: user?.username,
    };
  }
}
