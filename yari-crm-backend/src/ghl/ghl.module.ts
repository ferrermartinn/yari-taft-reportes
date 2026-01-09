import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GhlService } from './ghl.service';
import { GhlController } from './ghl.controller';

@Module({
  imports: [HttpModule],
  controllers: [GhlController],
  providers: [GhlService],
  exports: [GhlService],
})
export class GhlModule {}