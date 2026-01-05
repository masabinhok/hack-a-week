import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import {
  RegisterDto,
  SendOtpDto,
  VerifyOtpDto,
  UpdateProfileDto,
  SaveServiceDto,
  UpdateSavedServiceDto,
  ContributionDto,
} from './dto';

interface TokenPayload {
  sub: string;
  phone: string;
  role: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // ==================== Authentication ====================

  /**
   * Send OTP to phone number for registration/login
   * In production, this would integrate with SMS gateways like Sparrow SMS
   */
  async sendOtp(
    dto: SendOtpDto,
  ): Promise<{ message: string; expiresIn: number }> {
    const normalizedPhone = this.normalizePhoneNumber(dto.phoneNumber);

    // Check rate limiting (max 3 OTPs per 10 minutes)
    const recentOtps = await this.prisma.otpVerification.count({
      where: {
        phoneNumber: normalizedPhone,
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes
        },
      },
    });

    if (recentOtps >= 3) {
      throw new BadRequestException(
        'Too many OTP requests. Please try again in 10 minutes.',
      );
    }

    // Generate 6-digit OTP
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP
    await this.prisma.otpVerification.create({
      data: {
        phoneNumber: normalizedPhone,
        otp,
        expiresAt,
      },
    });

    // In production, send SMS here
    // await this.smsService.send(normalizedPhone, `Your Setu verification code is: ${otp}`);
    console.log(`[DEV] OTP for ${normalizedPhone}: ${otp}`);

    return {
      message: 'OTP sent successfully',
      expiresIn: 300, // 5 minutes in seconds
    };
  }

  /**
   * Verify OTP and authenticate user
   * Creates new user if phone number is not registered
   */
  async verifyOtp(dto: VerifyOtpDto): Promise<{
    user: {
      id: string;
      phoneNumber: string;
      fullName: string | null;
      email: string | null;
      isNewUser: boolean;
    };
    tokens: TokenResponse;
  }> {
    const normalizedPhone = this.normalizePhoneNumber(dto.phoneNumber);

    // Find latest valid OTP
    const otpRecord = await this.prisma.otpVerification.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        verified: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException(
        'OTP expired or not found. Please request a new one.',
      );
    }

    // Check attempts (max 3)
    if (otpRecord.attempts >= 3) {
      throw new BadRequestException(
        'Too many failed attempts. Please request a new OTP.',
      );
    }

    // Verify OTP
    if (otpRecord.otp !== dto.otp) {
      await this.prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid OTP. Please try again.');
    }

    // Mark OTP as verified
    await this.prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    const isNewUser = !user;

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phoneNumber: normalizedPhone,
          phoneVerified: true,
          role: 'USER',
        },
      });
    } else {
      // Update phone verified status if needed
      if (!user.phoneVerified) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { phoneVerified: true },
        });
      }
    }

    // Generate tokens
    const tokens = await this.generateTokens(
      user.id,
      normalizedPhone,
      user.role,
    );

    // Store refresh token hash
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    // Cleanup old OTPs
    await this.cleanupOldOtps(normalizedPhone);

    return {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber!,
        fullName: user.fullName,
        email: user.email,
        isNewUser,
      },
      tokens,
    };
  }

  /**
   * Register user with additional details after OTP verification
   */
  async register(
    userId: string,
    dto: RegisterDto,
  ): Promise<{
    id: string;
    phoneNumber: string;
    fullName: string | null;
    email: string | null;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is already taken
    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingEmail && existingEmail.id !== userId) {
        throw new ConflictException('Email is already registered');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        email: dto.email,
      },
    });

    return {
      id: updated.id,
      phoneNumber: updated.phoneNumber!,
      fullName: updated.fullName,
      email: updated.email,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<TokenResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verify refresh token matches
    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.phoneNumber || user.username || '',
      user.role,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return tokens;
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // ==================== Profile Management ====================

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phoneNumber: true,
        phoneVerified: true,
        email: true,
        emailVerified: true,
        fullName: true,
        nationalId: true,
        permanentProvinceId: true,
        permanentDistrictId: true,
        permanentMunicipalityId: true,
        permanentWardId: true,
        convenientProvinceId: true,
        convenientDistrictId: true,
        convenientMunicipalityId: true,
        convenientWardId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is already taken
    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email is already registered');
      }
    }

    // Check if nationalId is already taken
    if (dto.nationalId && dto.nationalId !== user.nationalId) {
      const existingNationalId = await this.prisma.user.findUnique({
        where: { nationalId: dto.nationalId },
      });
      if (existingNationalId) {
        throw new ConflictException('National ID is already registered');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName ?? user.fullName,
        email: dto.email ?? user.email,
        nationalId: dto.nationalId ?? user.nationalId,
        permanentProvinceId:
          dto.permanentProvinceId ?? user.permanentProvinceId,
        permanentDistrictId:
          dto.permanentDistrictId ?? user.permanentDistrictId,
        permanentMunicipalityId:
          dto.permanentMunicipalityId ?? user.permanentMunicipalityId,
        permanentWardId: dto.permanentWardId ?? user.permanentWardId,
        convenientProvinceId:
          dto.convenientProvinceId ?? user.convenientProvinceId,
        convenientDistrictId:
          dto.convenientDistrictId ?? user.convenientDistrictId,
        convenientMunicipalityId:
          dto.convenientMunicipalityId ?? user.convenientMunicipalityId,
        convenientWardId: dto.convenientWardId ?? user.convenientWardId,
      },
      select: {
        id: true,
        phoneNumber: true,
        email: true,
        fullName: true,
        nationalId: true,
        permanentProvinceId: true,
        permanentDistrictId: true,
        permanentMunicipalityId: true,
        permanentWardId: true,
        convenientProvinceId: true,
        convenientDistrictId: true,
        convenientMunicipalityId: true,
        convenientWardId: true,
      },
    });

    return updated;
  }

  // ==================== Saved Services ====================

  async getSavedServices(userId: string) {
    const services = await this.prisma.savedService.findMany({
      where: { userId },
      include: {
        service: {
          select: {
            id: true,
            serviceId: true,
            name: true,
            slug: true,
            description: true,
            priority: true,
            isOnlineEnabled: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return services;
  }

  async saveService(userId: string, dto: SaveServiceDto) {
    // Check if service exists
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Check if already saved
    const existing = await this.prisma.savedService.findUnique({
      where: {
        userId_serviceId: {
          userId,
          serviceId: dto.serviceId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Service already saved');
    }

    const saved = await this.prisma.savedService.create({
      data: {
        userId,
        serviceId: dto.serviceId,
        notes: dto.notes,
      },
      include: {
        service: {
          select: {
            id: true,
            serviceId: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return saved;
  }

  async updateSavedService(
    userId: string,
    savedServiceId: string,
    dto: UpdateSavedServiceDto,
  ) {
    const savedService = await this.prisma.savedService.findFirst({
      where: {
        id: savedServiceId,
        userId,
      },
    });

    if (!savedService) {
      throw new NotFoundException('Saved service not found');
    }

    const updated = await this.prisma.savedService.update({
      where: { id: savedServiceId },
      data: {
        notes: dto.notes ?? savedService.notes,
        status: dto.status ?? savedService.status,
        progress: dto.progress ?? (savedService.progress as any) ?? undefined,
      },
      include: {
        service: {
          select: {
            id: true,
            serviceId: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return updated;
  }

  async removeSavedService(userId: string, savedServiceId: string) {
    const savedService = await this.prisma.savedService.findFirst({
      where: {
        id: savedServiceId,
        userId,
      },
    });

    if (!savedService) {
      throw new NotFoundException('Saved service not found');
    }

    await this.prisma.savedService.delete({
      where: { id: savedServiceId },
    });

    return { message: 'Service removed from saved list' };
  }

  // ==================== User Contributions ====================

  async getContributions(userId: string) {
    const contributions = await this.prisma.userContribution.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return contributions;
  }

  async createContribution(userId: string, dto: ContributionDto) {
    // Validate service or office exists
    if (dto.serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: dto.serviceId },
      });
      if (!service) {
        throw new NotFoundException('Service not found');
      }
    }

    if (dto.officeId) {
      const office = await this.prisma.office.findUnique({
        where: { id: dto.officeId },
      });
      if (!office) {
        throw new NotFoundException('Office not found');
      }
    }

    const contribution = await this.prisma.userContribution.create({
      data: {
        userId,
        serviceId: dto.serviceId,
        officeId: dto.officeId,
        type: dto.type,
        content: dto.content,
      },
    });

    return contribution;
  }

  // ==================== Helper Methods ====================

  private normalizePhoneNumber(phone: string): string {
    // Remove +977 prefix if present and ensure 10-digit format
    const normalized = phone.replace(/^\+977/, '');
    // Ensure it starts with 9
    if (!normalized.startsWith('9')) {
      throw new BadRequestException('Invalid Nepali phone number');
    }
    return normalized;
  }

  private generateOtp(): string {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async generateTokens(
    userId: string,
    phone: string,
    role: string,
  ): Promise<TokenResponse> {
    const payload: TokenPayload = {
      sub: userId,
      phone,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async cleanupOldOtps(phoneNumber: string): Promise<void> {
    // Delete all verified and expired OTPs for this phone
    await this.prisma.otpVerification.deleteMany({
      where: {
        phoneNumber,
        OR: [{ verified: true }, { expiresAt: { lt: new Date() } }],
      },
    });
  }
}
