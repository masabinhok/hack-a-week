import { Controller, Get, Param } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async getAllServices(){
    return this.servicesService.getAllServices();
  }

  @Get(':slug')
  async getServiceBySlug(@Param('slug') slug: string) {
    return this.servicesService.getServiceBySlug(slug);
  }
}
