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
import { AdminOfficesService } from './admin-offices.service';
import { CreateOfficeDto, UpdateOfficeDto, AdminOfficeQueryDto } from '../dto/create-office.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('admin/offices')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminOfficesController {
  constructor(private readonly adminOfficesService: AdminOfficesService) {}

  /**
   * GET /admin/offices
   * Get all offices with pagination and filters
   */
  @Get()
  async findAll(@Query() query: AdminOfficeQueryDto) {
    return this.adminOfficesService.findAll(query);
  }

  /**
   * GET /admin/offices/stats
   * Get office statistics for dashboard
   */
  @Get('stats')
  async getStats() {
    return this.adminOfficesService.getStats();
  }

  /**
   * GET /admin/offices/categories
   * Get all office categories for dropdown
   */
  @Get('categories')
  async getCategories() {
    return this.adminOfficesService.getCategories();
  }

  /**
   * GET /admin/offices/:id
   * Get a single office by ID with all details
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.adminOfficesService.findOne(id);
  }

  /**
   * POST /admin/offices
   * Create a new office
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOfficeDto, @GetUser() user: any) {
    const result = await this.adminOfficesService.create(dto);
    return {
      ...result,
      createdBy: user?.username,
    };
  }

  /**
   * PUT /admin/offices/:id
   * Update an existing office
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOfficeDto,
    @GetUser() user: any,
  ) {
    const result = await this.adminOfficesService.update(id, dto);
    return {
      ...result,
      updatedBy: user?.username,
    };
  }

  /**
   * DELETE /admin/offices/:id
   * Delete an office
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @GetUser() user: any) {
    const result = await this.adminOfficesService.delete(id);
    return {
      ...result,
      deletedBy: user?.username,
    };
  }
}
