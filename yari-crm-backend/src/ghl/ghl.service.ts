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
    this.apiKey = this.configService.get<string>('GHL_API_KEY') || '';
    this.locationId = this.configService.get<string>('GHL_LOCATION_ID') || '';
  }

  async getAllContacts() {
    this.logger.log(`📡 Descargando contactos de GHL (Location: ${this.locationId})...`);
    
    let allContacts: any[] = [];
    let startAfterId = null;
    let hasMore = true;

    try {
      while (hasMore) {
        const url = `${this.baseUrl}/contacts/`;
        const headers = {
          Authorization: `Bearer ${this.apiKey}`,
          Version: '2021-07-28',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        };

        const params: any = {
          locationId: this.locationId,
          limit: 100,
        };

        if (startAfterId) params.startAfterId = startAfterId;

        const { data } = await firstValueFrom(
          this.httpService.get(url, { headers, params }),
        );

        const contacts = data.contacts || [];
        allContacts = [...allContacts, ...contacts];

        this.logger.log(
          `📦 Batch: ${contacts.length} (Total: ${allContacts.length})`,
        );

        if (data.meta && data.meta.startAfterId) {
          startAfterId = data.meta.startAfterId;
        } else {
          hasMore = false;
        }
      }

      this.logger.log(`✅ Descarga completa: ${allContacts.length} contactos`);
      return allContacts;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      this.logger.error(`❌ Error descargando contactos: ${errorMsg}`);
      throw error;
    }
  }

  async getContactByEmail(email: string) {
    try {
      const url = `${this.baseUrl}/contacts/search`;
      const headers = {
        Authorization: `Bearer ${this.apiKey}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
      };

      const params = {
        locationId: this.locationId,
        email: email,
      };

      const { data } = await firstValueFrom(
        this.httpService.get(url, { headers, params }),
      );

      if (data.contacts && data.contacts.length > 0) {
        return data.contacts[0];
      }

      return null;
    } catch (error) {
      this.logger.error(`❌ Error buscando contacto: ${error.message}`);
      return null;
    }
  }

  async updateMagicLink(contactId: string, magicLink: string) {
    try {
      const url = `${this.baseUrl}/contacts/${contactId}`;
      const headers = {
        Authorization: `Bearer ${this.apiKey}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
      };

      const payload = {
        customFields: [
          {
            key: 'magic_link',
            value: magicLink,
          },
        ],
      };

      await firstValueFrom(this.httpService.put(url, payload, { headers }));

      this.logger.log(`✅ Magic Link actualizado para contacto ${contactId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `❌ Error actualizando Magic Link: ${error.response?.data?.message || error.message}`,
      );
      return false;
    }
  }

  async addTag(contactId: string, tagName: string) {
    try {
      const url = `${this.baseUrl}/contacts/${contactId}/tags`;
      const headers = {
        Authorization: `Bearer ${this.apiKey}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
      };

      const payload = { tags: [tagName] };

      await firstValueFrom(this.httpService.post(url, payload, { headers }));

      this.logger.log(`✅ Tag "${tagName}" añadido a ${contactId}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Error añadiendo tag: ${error.message}`);
      return false;
    }
  }

  async removeTag(contactId: string, tagName: string) {
    try {
      const url = `${this.baseUrl}/contacts/${contactId}/tags`;
      const headers = {
        Authorization: `Bearer ${this.apiKey}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
      };

      const payload = { tags: [tagName] };

      await firstValueFrom(this.httpService.delete(url, { headers, data: payload }));

      this.logger.log(`✅ Tag "${tagName}" removido de ${contactId}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Error removiendo tag: ${error.message}`);
      return false;
    }
  }

  async batchUpdateMagicLinks(updates: Array<{ contactId: string; magicLink: string }>) {
    this.logger.log(`🔄 Iniciando actualización masiva de ${updates.length} contactos...`);
    
    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      const success = await this.updateMagicLink(update.contactId, update.magicLink);
      
      if (success) {
        successCount++;
        await this.addTag(update.contactId, 'ENVIAR_REPORTE');
      } else {
        errorCount++;
      }

      await this.sleep(200);
    }

    this.logger.log(
      `✅ Actualización masiva completa: ${successCount} éxitos, ${errorCount} errores`,
    );

    return { successCount, errorCount };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}