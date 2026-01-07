import { Test, TestingModule } from '@nestjs/testing';
import { WildmailService } from './wildmail.service';

describe('WildmailService', () => {
  let service: WildmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WildmailService],
    }).compile();

    service = module.get<WildmailService>(WildmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
