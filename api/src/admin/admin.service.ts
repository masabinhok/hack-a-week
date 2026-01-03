import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto';
import { JwtPayload, TokenResponse } from './interfaces/jwt-payload.interface';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<TokenResponse> {
    // Find user by username
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.username, user.role);

    // Update refresh token in database
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    // Clear refresh token from database
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<TokenResponse> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    // Verify refresh token
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.username, user.role);

    // Update refresh token in database
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return tokens;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async generateTokens(
    userId: string,
    username: string,
    role: string,
  ): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: userId,
      username,
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

    return {
      accessToken,
      refreshToken,
    };
  }

  // Helper method to create admin user (for seeding)
  async createAdminUser(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });
  }
}
