import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], 
  providers: [SupabaseService],
  exports: [SupabaseService], // <--- ¡ESTA LÍNEA ES LA CLAVE! Sin esto, nadie más puede usarlo.
})
export class SupabaseModule {}