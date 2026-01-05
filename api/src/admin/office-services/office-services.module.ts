import { Module } from '@nestjs/common';
import { OfficeServicesController } from './office-services.controller';
import { OfficeServicesService } from './office-services.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OfficeServicesController],
  providers: [OfficeServicesService],
  exports: [OfficeServicesService],
})
export class OfficeServicesModule {}
