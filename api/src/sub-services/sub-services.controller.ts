import { Controller, Get, Param } from '@nestjs/common';
import { SubServicesService } from './sub-services.service';

@Controller('sub-services')
export class SubServicesController {
  constructor(private readonly subServicesService: SubServicesService) {}

  @Get(':slug')
  async getSubServiceBySlug(@Param('slug') slug: string) {
    return this.subServicesService.getSubServiceBySlug(slug);
  }

}
