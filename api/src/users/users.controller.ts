import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { UsersService } from './users.service';
import {
  SendOtpDto,
  VerifyOtpDto,
  RegisterDto,
  UpdateProfileDto,
  SaveServiceDto,
  UpdateSavedServiceDto,
  ContributionDto,
} from './dto';
import { UserAuthGuard } from './guards/user-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { COOKIE_CONFIG } from '../common/constants/cookie.config';

interface UserPayload {
  sub: string;
  phone: string;
  role: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ==================== Authentication Routes ====================

  @Public()
  @Post('auth/send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.usersService.sendOtp(dto);
  }

  @Public()
  @Post('auth/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.usersService.verifyOtp(dto);

    // Set cookies for tokens
    res.cookie(
      COOKIE_CONFIG.ACCESS_TOKEN.name,
      result.tokens.accessToken,
      COOKIE_CONFIG.ACCESS_TOKEN.options,
    );
    res.cookie(
      COOKIE_CONFIG.REFRESH_TOKEN.name,
      result.tokens.refreshToken,
      COOKIE_CONFIG.REFRESH_TOKEN.options,
    );

    return {
      user: result.user,
      message: result.user.isNewUser
        ? 'Welcome! Please complete your profile.'
        : 'Login successful',
    };
  }

  @UseGuards(UserAuthGuard)
  @Post('auth/register')
  @HttpCode(HttpStatus.OK)
  async register(
    @CurrentUser() user: UserPayload,
    @Body() dto: RegisterDto,
  ) {
    return this.usersService.register(user.sub, dto);
  }

  @UseGuards(UserAuthGuard)
  @Post('auth/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @CurrentUser() user: UserPayload,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies[COOKIE_CONFIG.REFRESH_TOKEN.name];
    const tokens = await this.usersService.refreshTokens(user.sub, refreshToken);

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

    return { message: 'Tokens refreshed successfully' };
  }

  @UseGuards(UserAuthGuard)
  @Post('auth/logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: UserPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.usersService.logout(user.sub);

    res.clearCookie(COOKIE_CONFIG.ACCESS_TOKEN.name);
    res.clearCookie(COOKIE_CONFIG.REFRESH_TOKEN.name);

    return { message: 'Logout successful' };
  }

  // ==================== Profile Routes ====================

  @UseGuards(UserAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: UserPayload) {
    return this.usersService.getProfile(user.sub);
  }

  @UseGuards(UserAuthGuard)
  @Put('profile')
  async updateProfile(
    @CurrentUser() user: UserPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  // ==================== Saved Services Routes ====================

  @UseGuards(UserAuthGuard)
  @Get('saved-services')
  async getSavedServices(@CurrentUser() user: UserPayload) {
    return this.usersService.getSavedServices(user.sub);
  }

  @UseGuards(UserAuthGuard)
  @Post('saved-services')
  async saveService(
    @CurrentUser() user: UserPayload,
    @Body() dto: SaveServiceDto,
  ) {
    return this.usersService.saveService(user.sub, dto);
  }

  @UseGuards(UserAuthGuard)
  @Put('saved-services/:id')
  async updateSavedService(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateSavedServiceDto,
  ) {
    return this.usersService.updateSavedService(user.sub, id, dto);
  }

  @UseGuards(UserAuthGuard)
  @Delete('saved-services/:id')
  async removeSavedService(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
  ) {
    return this.usersService.removeSavedService(user.sub, id);
  }

  // ==================== Contribution Routes ====================

  @UseGuards(UserAuthGuard)
  @Get('contributions')
  async getContributions(@CurrentUser() user: UserPayload) {
    return this.usersService.getContributions(user.sub);
  }

  @UseGuards(UserAuthGuard)
  @Post('contributions')
  async createContribution(
    @CurrentUser() user: UserPayload,
    @Body() dto: ContributionDto,
  ) {
    return this.usersService.createContribution(user.sub, dto);
  }
}
