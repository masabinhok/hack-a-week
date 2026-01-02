import { Module } from '@nestjs/common';
import { OfficesService } from './offices.service.new';
import { OfficesController } from './offices.controller.new';

@Module({
  controllers: [OfficesController],
  providers: [OfficesService],
})
export class OfficesModule {}
