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
import {
  CreateOfficeDto,
  UpdateOfficeDto,
  AdminOfficeQueryDto,
} from '../dto/create-office.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OfficeOwnerGuard } from '../../common/guards/office-owner.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('admin/offices')
@UseGuards(AuthGuard, RolesGuard)
export class AdminOfficesController {
  constructor(private readonly adminOfficesService: AdminOfficesService) {}

  /**
   * GET /admin/offices
   * Get all offices with pagination and filters
   * ADMIN sees all offices, OFFICE_ADMIN sees only their office
   */
  @Get()
  @Roles('ADMIN', 'OFFICE_ADMIN')
  async findAll(@Query() query: AdminOfficeQueryDto, @GetUser() user: any) {
    // If OFFICE_ADMIN, filter to only their office
    if (user.role === 'OFFICE_ADMIN') {
      return this.adminOfficesService.findByOfficeAdmin(user.sub);
    }
    return this.adminOfficesService.findAll(query);
  }

  /**
   * GET /admin/offices/stats
   * Get office statistics for dashboard (ADMIN only)
   */
  @Get('stats')
  @Roles('ADMIN')
  async getStats() {
    return this.adminOfficesService.getStats();
  }

  /**
   * GET /admin/offices/categories
   * Get all office categories for dropdown
   */
  @Get('categories')
  @Roles('ADMIN', 'OFFICE_ADMIN')
  async getCategories() {
    return this.adminOfficesService.getCategories();
  }

  /**
   * GET /admin/offices/my-office
   * Get the office managed by the current OFFICE_ADMIN
   */
  @Get('my-office')
  @Roles('OFFICE_ADMIN')
  async getMyOffice(@GetUser() user: any) {
    return this.adminOfficesService.findByOfficeAdmin(user.sub);
  }

  /**
   * GET /admin/offices/:id
   * Get a single office by ID with all details
   */
  @Get(':id')
  @Roles('ADMIN', 'OFFICE_ADMIN')
  @UseGuards(OfficeOwnerGuard)
  async findOne(@Param('id') id: string) {
    return this.adminOfficesService.findOne(id);
  }

  /**
   * POST /admin/offices
   * Create a new office (ADMIN only - auto-generates office admin credentials)
   */
  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOfficeDto, @GetUser() user: any) {
    const result = await this.adminOfficesService.create(dto);
    return {
      ...result,
      createdBy: user?.username,
    };
  }

  /**
   * POST /admin/offices/:id/reset-password
   * Reset office admin password (ADMIN only)
   */
  @Post(':id/reset-password')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async resetOfficeAdminPassword(
    @Param('id') id: string,
    @GetUser() user: any,
  ) {
    const result = await this.adminOfficesService.resetOfficeAdminPassword(id);
    return {
      ...result,
      resetBy: user?.username,
    };
  }

  /**
   * PUT /admin/offices/:id
   * Update an existing office
   * ADMIN can update any office, OFFICE_ADMIN can only update their own
   */
  @Put(':id')
  @Roles('ADMIN', 'OFFICE_ADMIN')
  @UseGuards(OfficeOwnerGuard)
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
   * Delete an office (ADMIN only)
   */
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @GetUser() user: any) {
    const result = await this.adminOfficesService.delete(id);
    return {
      ...result,
      deletedBy: user?.username,
    };
  }
}
