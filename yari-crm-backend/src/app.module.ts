import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';

import { StudentsModule } from './students/students.module';
import { MagicLinksModule } from './magic-links/magic-links.module';
import { WeeklyReportsModule } from './weekly-reports/weekly-reports.module';
import { MailModule } from './mail/mail.module';
import { SupabaseModule } from './supabase/supabase.module';
import { SyncModule } from './sync/sync.module';
import { ConfigModule as SystemConfigModule } from './config/config.module';
import { AuditModule } from './audit/audit.module';
import { StaffModule } from './staff/staff.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    
    StudentsModule,
    MagicLinksModule,
    WeeklyReportsModule,
    MailModule,
    SupabaseModule,
    SyncModule,
    SystemConfigModule,
    AuditModule,
    StaffModule,
  ],
  controllers: [AppController],
})
export class AppModule {}