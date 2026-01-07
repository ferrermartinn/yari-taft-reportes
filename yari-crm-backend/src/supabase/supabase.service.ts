import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    // Prioriza la clave de servicio (Admin) si existe, sino usa la anónima/pública
    const supabaseKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      // MEJORA: Lanzamos error para detener la app si falta configuración crítica
      throw new Error(
        '❌ DETENIENDO APP: Faltan SUPABASE_URL o SUPABASE_KEY en el archivo .env',
      );
    }

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger.log('✅ Conexión con Supabase inicializada correctamente');
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}