import { Module } from '@nestjs/common';
import { AdminOfficesController } from './admin-offices.controller';
import { AdminOfficesService } from './admin-offices.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminOfficesController],
  providers: [AdminOfficesService],
  exports: [AdminOfficesService],
})
export class AdminOfficesModule {}
