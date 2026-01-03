import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { LoginDto } from './dto';
import { Public } from '../common/decorators/public.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { RefreshTokenGuard } from '../common/guards/refresh-token.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { COOKIE_CONFIG } from '../common/constants/cookie.config';
import type { Response } from 'express';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.adminService.login(dto);

    // Set cookies
    res.cookie(
      COOKIE_CONFIG.ACCESS_TOKEN.name,
      tokens.accessToken,
      COOKIE_CONFIG.ACCESS_TOKEN.options,
    );
    res.cookie(
      COOKIE_CONFIG.REFRESH_TOKEN.name,
      tokens.refreshToken,
      COOKIE_CONFIG.REFRESH_TOKEN.options,
    );

    return {
      message: 'Login successful',
      user: {
        username: dto.username,
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @GetUser('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.adminService.logout(userId);

    // Clear cookies
    res.clearCookie(COOKIE_CONFIG.ACCESS_TOKEN.name);
    res.clearCookie(COOKIE_CONFIG.REFRESH_TOKEN.name);

    return {
      message: 'Logout successful',
    };
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @GetUser('sub') userId: string,
    @GetUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.adminService.refreshTokens(userId, refreshToken);

    // Set new cookies
    res.cookie(
      COOKIE_CONFIG.ACCESS_TOKEN.name,
      tokens.accessToken,
      COOKIE_CONFIG.ACCESS_TOKEN.options,
    );
    res.cookie(
      COOKIE_CONFIG.REFRESH_TOKEN.name,
      tokens.refreshToken,
      COOKIE_CONFIG.REFRESH_TOKEN.options,
    );

    return {
      message: 'Tokens refreshed successfully',
    };
  }

  @Get('profile')
  async getProfile(@GetUser('sub') userId: string) {
    const profile = await this.adminService.getProfile(userId);
    return {
      message: 'Profile retrieved successfully',
      data: profile,
    };
  }

  // Example protected route that only ADMIN can access
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('dashboard')
  async getDashboard(@GetUser() user: any) {
    return {
      message: 'Welcome to admin dashboard',
      user: {
        id: user.sub,
        username: user.username,
        role: user.role,
      },
      stats: {
        totalUsers: 100,
        totalServices: 50,
        totalOffices: 200,
      },
    };
  }

  // Another example protected route with ADMIN role
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('users')
  async getAllUsers(@GetUser() user: any) {
    return {
      message: 'Admin-only route to get all users',
      requestedBy: {
        id: user.sub,
        username: user.username,
        role: user.role,
      },
      data: [],
    };
  }
}
