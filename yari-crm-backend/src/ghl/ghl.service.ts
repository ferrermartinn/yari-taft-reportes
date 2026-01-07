import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GhlService {
  private readonly logger = new Logger(GhlService.name);
  private readonly apiKey: string;
  private readonly locationId: string;
  private readonly baseUrl = 'https://services.leadconnectorhq.com'; 

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    // El || '' al final arregla el error de "undefined"
    this.apiKey = this.configService.get<string>('GHL_API_KEY') || '';
    this.locationId = this.configService.get<string>('GHL_LOCATION_ID') || '';
  }

  async getContacts() {
    this.logger.log(`📡 Iniciando descarga masiva de GHL (Location: ${this.locationId})...`);
    
    // 👇 AQUÍ ESTABA EL ERROR: Le decimos explícitamente que es un array de cualquier cosa
    let allContacts: any[] = []; 
    let startAfterId = null;
    let hasMore = true;

    try {
      while (hasMore) {
        const url = `${this.baseUrl}/contacts/`;
        
        const headers = { 
          'Authorization': `Bearer ${this.apiKey}`,
          'Version': '2021-07-28', 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };

        const params: any = {
          locationId: this.locationId,
          limit: 100, 
        };

        if (startAfterId) {
          params.startAfterId = startAfterId;
        }

        const { data } = await firstValueFrom(
          this.httpService.get(url, { headers, params })
        );

        const contacts = data.contacts || [];
        allContacts = [...allContacts, ...contacts];

        this.logger.log(`🔹 Descargados: ${contacts.length} (Total acumulado: ${allContacts.length})`);

        if (data.meta && data.meta.startAfterId) {
          startAfterId = data.meta.startAfterId;
        } else {
          hasMore = false;
        }
      }

      this.logger.log(`✅ EXITO TOTAL: Se descargaron ${allContacts.length} contactos.`);
      return allContacts;

    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      this.logger.error(`❌ Error GHL: ${errorMsg}`);
      throw error;
    }
  }
}