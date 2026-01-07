import { Test, TestingModule } from '@nestjs/testing';
import { WeeklyReportsController } from './weekly-reports.controller';
import { WeeklyReportsService } from './weekly-reports.service';

describe('WeeklyReportsController', () => {
  let controller: WeeklyReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeeklyReportsController],
      providers: [WeeklyReportsService],
    }).compile();

    controller = module.get<WeeklyReportsController>(WeeklyReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
