import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  
  // TUS CREDENCIALES
  private readonly apiUrl = 'https://yaritaft.api-us1.com'; 
  private readonly apiKey = '2186366fc336bba5147826efed11d6ffa48ffe7c94286cde9396415db4f3acfabf0d50c1';
  
  // EL ID DEL CAMPO MAGIC_LINK
  private readonly fieldId = '17'; 

  async sendMagicLink(email: string, link: string, name: string) {
    this.logger.log(`📧 [WILDMAIL] Actualizando contacto: ${email} (Campo ID: ${this.fieldId})`);

    try {
      const contactData = {
        contact: {
          email: email,
          firstName: name,
          fieldValues: [
            {
              field: this.fieldId, 
              value: link          
            }
          ]
        }
      };

      const response = await axios.post(`${this.apiUrl}/api/3/contact/sync`, contactData, {
        headers: { 
            'Api-Token': this.apiKey,
            'Content-Type': 'application/json'
        }
      });

      const contactId = response.data.contact.id;
      this.logger.log(`✅ [EXITO] WildMail actualizado. ID Contacto: ${contactId}. Esperando automatización...`);
      return { success: true, contactId };

    } catch (error) {
      this.logger.error('❌ Error conectando con WildMail', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  // (Auxiliar por compatibilidad)
  async createFieldAutomatically() { return { message: 'Ok' }; }
}