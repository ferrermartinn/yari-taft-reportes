import { Module } from '@nestjs/common';
import { MagicLinksService } from './magic-links.service';
import { MagicLinksController } from './magic-links.controller';
import { MailModule } from '../mail/mail.module'; // 👈 IMPORTANTE

@Module({
  imports: [MailModule], // 👈 ESTO ES LO QUE FALTABA
  controllers: [MagicLinksController],
  providers: [MagicLinksService],
  exports: [MagicLinksService],
})
export class MagicLinksModule {}