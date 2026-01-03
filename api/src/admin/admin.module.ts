import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminServicesModule } from './services/admin-services.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({}), // Configuration is done via ConfigService in the service
    AdminServicesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
