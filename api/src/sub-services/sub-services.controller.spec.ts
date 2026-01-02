import { Test, TestingModule } from '@nestjs/testing';
import { SubServicesController } from './sub-services.controller';
import { SubServicesService } from './sub-services.service';

describe('SubServicesController', () => {
  let controller: SubServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubServicesController],
      providers: [SubServicesService],
    }).compile();

    controller = module.get<SubServicesController>(SubServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
