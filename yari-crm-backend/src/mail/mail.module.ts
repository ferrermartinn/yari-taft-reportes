import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GmailService } from './gmail.service';

@Module({
  imports: [HttpModule],
  providers: [GmailService],
  exports: [GmailService],
})
export class MailModule {}