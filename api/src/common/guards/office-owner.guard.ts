import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from './roles.guard';

/**
 * Guard that checks if an OFFICE_ADMIN user owns the office they're trying to access.
 * ADMIN users bypass this check entirely.
 * This guard should be used AFTER AuthGuard and RolesGuard.
 */
@Injectable()
export class OfficeOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    // ADMIN can access any office
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // OFFICE_ADMIN can only access their own office
    if (user.role === UserRole.OFFICE_ADMIN) {
      const officeId = request.params.id || request.body.officeId;

      if (!officeId) {
        // For list operations, let the service handle filtering
        return true;
      }

      // Check if this user is the admin of this office
      const office = await this.prisma.office.findUnique({
        where: { id: officeId },
        select: { officeAdminId: true },
      });

      if (!office) {
        // Let the controller handle 404
        return true;
      }

      if (office.officeAdminId !== user.sub) {
        throw new ForbiddenException('You can only access your own office');
      }

      return true;
    }

    // Other roles don't have access
    throw new ForbiddenException('Insufficient permissions');
  }
}
