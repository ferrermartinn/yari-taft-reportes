import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { GhlModule } from '../ghl/ghl.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { HttpModule } from '@nestjs/axios'; // <--- IMPORTANTE
import { ConfigModule } from '@nestjs/config'; // <--- IMPORTANTE

@Module({
  imports: [
    HttpModule,     // <--- Necesario para hacer llamadas HTTP
    ConfigModule,   // <--- Necesario para leer .env
    GhlModule, 
    SupabaseModule
  ], 
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}