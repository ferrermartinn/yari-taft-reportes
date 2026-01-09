import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WildmailService } from './wildmail.service';

@Module({
  imports: [HttpModule],
  providers: [WildmailService],
  exports: [WildmailService],
})
export class WildmailModule {}