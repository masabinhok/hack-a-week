import { Module } from '@nestjs/common';
import { AdminOfficesController } from './admin-offices.controller';
import { AdminOfficesService } from './admin-offices.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { OfficeOwnerGuard } from '../../common/guards/office-owner.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AdminOfficesController],
  providers: [AdminOfficesService, OfficeOwnerGuard],
  exports: [AdminOfficesService],
})
export class AdminOfficesModule {}
