import { Module } from '@nestjs/common';
import { MagicLinksService } from './magic-links.service';
import { MagicLinksController } from './magic-links.controller';
import { MailModule } from '../mail/mail.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [MailModule, ConfigModule],
  controllers: [MagicLinksController],
  providers: [MagicLinksService],
  exports: [MagicLinksService],
})
export class MagicLinksModule {}