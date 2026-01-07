import { Module } from '@nestjs/common';
import { WeeklyReportsService } from './weekly-reports.service';
import { WeeklyReportsController } from './weekly-reports.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { WildmailModule } from '../wildmail/wildmail.module'; // <--- IMPORTANTE

@Module({
  imports: [
    SupabaseModule, 
    WildmailModule // <--- ESTO ES LO QUE FALTA
  ],
  controllers: [WeeklyReportsController],
  providers: [WeeklyReportsService],
})
export class WeeklyReportsModule {}