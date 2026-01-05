import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import {
  CreateServiceRequestDto,
  ReviewServiceRequestDto,
  RejectServiceRequestDto,
  ServiceRequestQueryDto,
} from '../dto/service-request.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('admin/services/requests')
@UseGuards(AuthGuard, RolesGuard)
export class ServiceRequestsController {
  constructor(
    private readonly serviceRequestsService: ServiceRequestsService,
  ) {}

  /**
   * POST /admin/services/requests
   * Create a new service request (Office Admin only)
   */
  @Post()
  @Roles('OFFICE_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async createRequest(
    @Body() dto: CreateServiceRequestDto,
    @GetUser() user: any,
  ) {
    return this.serviceRequestsService.createRequest(dto, user.sub);
  }

  /**
   * GET /admin/services/requests
   * Get all service requests (Admin sees all, Office Admin sees own)
   */
  @Get()
  @Roles('ADMIN', 'OFFICE_ADMIN')
  async getRequests(
    @Query() query: ServiceRequestQueryDto,
    @GetUser() user: any,
  ) {
    return this.serviceRequestsService.getRequests(query, user.sub, user.role);
  }

  /**
   * GET /admin/services/requests/stats
   * Get service request statistics (Admin only)
   */
  @Get('stats')
  @Roles('ADMIN')
  async getStats() {
    return this.serviceRequestsService.getStats();
  }

  /**
   * GET /admin/services/requests/:id
   * Get single service request by ID
   */
  @Get(':id')
  @Roles('ADMIN', 'OFFICE_ADMIN')
  async getRequestById(@Param('id') id: string, @GetUser() user: any) {
    return this.serviceRequestsService.getRequestById(id, user.sub, user.role);
  }

  /**
   * POST /admin/services/requests/:id/approve
   * Approve a service request (Super Admin only)
   */
  @Post(':id/approve')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async approveRequest(
    @Param('id') id: string,
    @Body() dto: ReviewServiceRequestDto,
    @GetUser() user: any,
  ) {
    return this.serviceRequestsService.approveRequest(id, dto, user.sub);
  }

  /**
   * POST /admin/services/requests/:id/reject
   * Reject a service request (Super Admin only)
   */
  @Post(':id/reject')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async rejectRequest(
    @Param('id') id: string,
    @Body() dto: RejectServiceRequestDto,
    @GetUser() user: any,
  ) {
    return this.serviceRequestsService.rejectRequest(id, dto, user.sub);
  }
}
