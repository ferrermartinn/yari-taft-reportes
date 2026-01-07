import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { SupabaseService } from '../supabase/supabase.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private readonly ghlApiKey: string;
  private readonly ghlLocationId: string;
  private readonly ghlBaseUrl = 'https://services.leadconnectorhq.com';

  // 👇 IMPORTANTE: Esta etiqueta debe ser IDÉNTICA a la que creaste en GHL
  private readonly STUDENT_TAG = 'ALUMNO_SISTEMA'; 

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {
    this.ghlApiKey = this.configService.get<string>('GHL_API_KEY') || '';
    this.ghlLocationId = this.configService.get<string>('GHL_LOCATION_ID') || '';
  }

  async syncAllContactsFromGHL() {
    this.logger.log(`🚀 Iniciando Sincronización FILTRADA (Solo tag: ${this.STUDENT_TAG})...`);
    
    let startAfterId = null;
    let hasMore = true;
    let totalProcessed = 0;
    let totalSaved = 0;
    let totalSkipped = 0;

    // Bucle para recorrer todas las páginas de GHL
    while (hasMore) {
      try {
        const url = `${this.ghlBaseUrl}/contacts/`;
        const params: any = {
          locationId: this.ghlLocationId,
          limit: 100,
        };
        if (startAfterId) params.startAfterId = startAfterId;

        const headers = { 
          'Authorization': `Bearer ${this.ghlApiKey}`,
          'Version': '2021-07-28', 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };

        const response = await firstValueFrom(this.httpService.get(url, { headers, params }));
        const contacts = response.data.contacts || [];

        if (contacts.length === 0) {
          hasMore = false;
          break;
        }

        this.logger.log(`📥 Analizando lote de ${contacts.length}...`);
        
        for (const contact of contacts) {
            totalProcessed++;
            
            const tags = contact.tags || [];
            
            // 🔍 FILTRO MAESTRO:
            // Verificamos si tiene el tag 'ALUMNO_SISTEMA' (ignorando mayúsculas/minúsculas)
            const hasStudentTag = tags.some((t: any) => String(t).toLowerCase() === this.STUDENT_TAG.toLowerCase());

            // Si NO tiene el tag, lo ignoramos y pasamos al siguiente
            if (!hasStudentTag) {
                totalSkipped++;
                continue; 
            }

            // Si llegamos aquí, ES UN ALUMNO REAL
            if (!contact.email) continue;
            
            // Verificamos si además está inactivo
            const isInactive = tags.some((t: any) => String(t).toLowerCase().includes('inactivo'));

            const studentData = {
                ghl_contact_id: contact.id,
                email: contact.email.toLowerCase(),
                full_name: contact.contactName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
                phone: contact.phone,
                city: contact.city,
                country: contact.country,
                status: isInactive ? 'inactive' : 'active',
                custom_fields: contact,
                updated_at: new Date(),
            };

            const { error } = await this.supabaseService.getClient()
                .from('students')
                .upsert(studentData, { onConflict: 'email' });

            if (!error) totalSaved++;
        }

        // Preparamos la siguiente página
        if (response.data.meta && response.data.meta.startAfterId) {
          startAfterId = response.data.meta.startAfterId;
        } else {
          hasMore = false;
        }
        
        // Pequeña pausa para no saturar
        await new Promise(resolve => setTimeout(resolve, 50)); 

      } catch (error) {
        this.logger.error(`❌ Error en el lote: ${error.message}`);
        hasMore = false; 
      }
    }

    this.logger.log(`✅ FIN. Total GHL: ${totalProcessed} | 🗑️ Ignorados (Leads): ${totalSkipped} | 💾 ALUMNOS GUARDADOS: ${totalSaved}`);
    return { processed: totalProcessed, skipped: totalSkipped, saved: totalSaved };
  }
}