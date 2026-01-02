import { Module } from '@nestjs/common';
import { ServicesService } from './services.service.new';
import { ServicesController } from './services.controller.new';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
