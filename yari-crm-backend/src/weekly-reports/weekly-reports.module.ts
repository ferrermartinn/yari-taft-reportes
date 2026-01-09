import { Module } from '@nestjs/common';
import { WeeklyReportsService } from './weekly-reports.service';
import { WeeklyReportsController } from './weekly-reports.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [WeeklyReportsController],
  providers: [WeeklyReportsService],
})
export class WeeklyReportsModule {}