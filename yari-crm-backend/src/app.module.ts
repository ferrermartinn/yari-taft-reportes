import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { StudentsModule } from './students/students.module';
import { MagicLinksModule } from './magic-links/magic-links.module';
import { WeeklyReportsModule } from './weekly-reports/weekly-reports.module';
import { MailModule } from './mail/mail.module';
import { SupabaseModule } from './supabase/supabase.module';
import { GhlModule } from './ghl/ghl.module';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    
    StudentsModule,
    MagicLinksModule,
    WeeklyReportsModule,
    MailModule,
    SupabaseModule,
    GhlModule,
    SyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}