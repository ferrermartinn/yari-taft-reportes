import { Test, TestingModule } from '@nestjs/testing';
import { GhlService } from './ghl.service';

describe('GhlService', () => {
  let service: GhlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GhlService],
    }).compile();

    service = module.get<GhlService>(GhlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
