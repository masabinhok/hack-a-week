import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { COOKIE_CONFIG } from '../constants/cookie.config';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      cookies: Record<string, string>;
      user?: any;
    }>();
    const token = request.cookies[COOKIE_CONFIG.REFRESH_TOKEN.name];

    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('Refresh Token missing or malformed');
    }

    try {
      const payload: any = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
      // Attach both payload and the token itself
      request.user = { ...payload, refreshToken: token };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired Refresh Token');
    }
  }
}
