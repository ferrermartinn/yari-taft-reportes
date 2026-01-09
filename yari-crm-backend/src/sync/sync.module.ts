import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { MailModule } from '../mail/mail.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    HttpModule,
    MailModule,
    ConfigModule,
  ],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}