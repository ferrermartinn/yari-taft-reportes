import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [NestConfigModule, SupabaseModule],
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
