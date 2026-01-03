import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserLocationsDto } from './dto/update-user-locations.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create or get user by phone
   * POST /users
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async findOrCreate(@Body() createUserDto: CreateUserDto) {
    return this.usersService.findOrCreate(createUserDto);
  }

  /**
   * Get user by ID
   * GET /users/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Get user by phone
   * GET /users/phone/:phone
   */
  @Get('phone/:phone')
  async findByPhone(@Param('phone') phone: string) {
    return this.usersService.findByPhone(phone);
  }

  /**
   * Update user locations
   * PUT /users/:id/locations
   */
  @Put(':id/locations')
  async updateLocations(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserLocationsDto,
  ) {
    return this.usersService.updateLocations(id, updateDto);
  }

  /**
   * Get user locations with full details
   * GET /users/:id/locations
   */
  @Get(':id/locations')
  async getLocations(@Param('id') id: string) {
    return this.usersService.getLocationsWithDetails(id);
  }
}
