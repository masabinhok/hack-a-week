import { Module } from '@nestjs/common';
import { SubServicesService } from './sub-services.service';
import { SubServicesController } from './sub-services.controller';

@Module({
  controllers: [SubServicesController],
  providers: [SubServicesService],
})
export class SubServicesModule {}
