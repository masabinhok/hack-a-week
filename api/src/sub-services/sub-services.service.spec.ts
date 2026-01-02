import { Test, TestingModule } from '@nestjs/testing';
import { SubServicesService } from './sub-services.service';

describe('SubServicesService', () => {
  let service: SubServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubServicesService],
    }).compile();

    service = module.get<SubServicesService>(SubServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
