import { Test, TestingModule } from '@nestjs/testing';
import { WeeklyReportsService } from './weekly-reports.service';

describe('WeeklyReportsService', () => {
  let service: WeeklyReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeeklyReportsService],
    }).compile();

    service = module.get<WeeklyReportsService>(WeeklyReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
