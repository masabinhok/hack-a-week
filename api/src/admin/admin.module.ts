import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminServicesModule } from './services/admin-services.module';
import { AdminOfficesModule } from './offices/admin-offices.module';
import { OfficeServicesModule } from './office-services/office-services.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({}), // Configuration is done via ConfigService in the service
    ServiceRequestsModule, // Must be before AdminServicesModule to avoid route conflicts
    AdminServicesModule,
    AdminOfficesModule,
    OfficeServicesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
