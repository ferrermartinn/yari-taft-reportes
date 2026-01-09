import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiUrl = this.configService.get<string>('WILDMAIL_API_URL') || 'https://yaritaft.api-us1.com';
    this.apiKey = this.configService.get<string>('WILDMAIL_API_KEY') || '';
    
    if (!this.apiKey) {
      this.logger.warn('⚠️ WILDMAIL_API_KEY no configurada. Los emails no se enviarán.');
    } else {
      this.logger.log(`✅ Wildmail configurado: ${this.apiUrl}`);
    }
  }

  async sendMagicLink(email: string, studentName: string, magicLink: string) {
    try {
      this.logger.log(`📧 Preparando email para: ${email}`);

      const firstName = studentName.split(' ')[0];

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">📊 Tu Reporte Semanal</h1>
  </div>
  
  <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; color: #333; line-height: 1.6;">
      Hola <strong>${firstName}</strong>,
    </p>
    
    <p style="font-size: 16px; color: #333; line-height: 1.6;">
      Tu reporte de progreso semanal ya está listo. Haz click en el botón para verlo:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${magicLink}" 
         style="background-color: #667eea; 
                color: white; 
                padding: 15px 40px; 
                text-decoration: none; 
                border-radius: 5px; 
                font-size: 18px; 
                font-weight: bold;
                display: inline-block;">
        📈 Ver Mi Reporte
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; line-height: 1.6;">
      <strong>⏰ Importante:</strong> Este enlace es válido por 7 días.
    </p>
    
    <p style="font-size: 14px; color: #999; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
      Si tienes problemas para acceder, contáctanos respondiendo este email.
    </p>
  </div>
</body>
</html>
      `;

      const headers = {
        'Api-Token': this.apiKey,
        'Content-Type': 'application/json',
      };

      // Método: Crear/actualizar contacto y luego crear campaña para enviar email usando dominio verificado
      return await this.sendViaContactAndCampaign(email, studentName, magicLink, emailHtml, headers);

    } catch (error: any) {
      this.logger.error(`❌ ERROR CRÍTICO enviando email a ${email}`);
      this.logger.error(`📋 Error: ${error.message}`);
      if (error.stack) {
        this.logger.error(`📋 Stack: ${error.stack}`);
      }
      throw error;
    }
  }

  private async sendViaContactAndCampaign(
    email: string,
    studentName: string,
    magicLink: string,
    emailHtml: string,
    headers: any,
  ) {
    let contactId: number | undefined;
    
    try {
      this.logger.log(`🔄 Creando contacto y enviando email usando dominio verificado...`);

      // Paso 1: Crear o actualizar contacto
      const contactUrl = `${this.apiUrl}/api/3/contacts`;
      const contactPayload = {
        contact: {
          email: email,
          firstName: studentName.split(' ')[0],
          lastName: studentName.split(' ').slice(1).join(' ') || '',
        },
      };

      this.logger.log(`👤 Creando/actualizando contacto: ${email}`);
      let contactResponse;
      try {
        contactResponse = await firstValueFrom(
          this.httpService.post(contactUrl, contactPayload, { headers }),
        );
      } catch (contactError: any) {
        // Si el contacto ya existe (422), lo obtenemos
        if (contactError.response?.status === 422) {
          this.logger.log(`⚠️ Contacto ya existe, obteniendo información...`);
          const getContactUrl = `${this.apiUrl}/api/3/contacts?email=${encodeURIComponent(email)}`;
          contactResponse = await firstValueFrom(
            this.httpService.get(getContactUrl, { headers }),
          );
        } else {
          throw contactError;
        }
      }

      contactId = contactResponse.data?.contact?.id || contactResponse.data?.contacts?.[0]?.id;
      this.logger.log(`✅ Contacto listo: ID ${contactId}`);

      // Paso 2: Crear un email en ActiveCampaign
      // Intentamos usar hola@yaritaft.com, si el dominio no está verificado
      // ActiveCampaign puede rechazarlo o usar un dominio por defecto
      const createEmailUrl = `${this.apiUrl}/api/3/emails`;
      const emailPayload = {
        email: {
          name: `Reporte Semanal - ${studentName} - ${Date.now()}`,
          type: 'mime',
          format: 'mime',
          subject: '📊 Tu Reporte Semanal Ya Está Listo',
          html: emailHtml,
          fromemail: 'hola@yaritaft.com', // Usa este email (puede requerir dominio verificado)
          fromname: 'Yari Taft',
        },
      };

      this.logger.log(`📝 Creando email en ActiveCampaign...`);
      const emailResponse = await firstValueFrom(
        this.httpService.post(createEmailUrl, emailPayload, { headers }),
      );

      const emailId = emailResponse.data?.email?.id;
      this.logger.log(`✅ Email creado: ID ${emailId}`);

      if (!contactId) {
        throw new Error('ContactId no disponible para crear campaña');
      }

      // Paso 3: Crear y enviar campaña inmediatamente (usa el dominio verificado)
      const createCampaignUrl = `${this.apiUrl}/api/3/campaigns`;
      const campaignPayload = {
        campaign: {
          type: 'single',
          name: `Reporte Semanal - ${studentName} - ${Date.now()}`,
          sdate: new Date().toISOString(),
          status: 1, // Activa e inmediata
          public: 0,
          tracklinks: 'all',
          trackreads: 1,
          htmlunsub: 1,
          textunsub: 0,
          p: { [String(contactId)]: contactId }, // Lista de contactos
          m: [emailId], // Lista de emails
        },
      };

      this.logger.log(`📤 Creando y enviando campaña usando dominio verificado...`);
      const campaignResponse = await firstValueFrom(
        this.httpService.post(createCampaignUrl, campaignPayload, { headers }),
      );

      const campaignId = campaignResponse.data?.campaign?.id;
      this.logger.log(`✅ Campaña creada y enviada: ID ${campaignId}`);
      this.logger.log(`✅ Email enviado exitosamente a ${email} vía ActiveCampaign usando dominio verificado`);

      return {
        success: true,
        data: {
          contactId,
          emailId,
          campaignId,
          message: 'Email enviado usando dominio verificado',
        },
      };

    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || error.message;

      this.logger.error(`❌ Error enviando email (Status: ${errorStatus})`);
      this.logger.error(`📋 Mensaje: ${errorMessage}`);
      this.logger.error(`📋 Detalles: ${JSON.stringify(errorData || {})}`);

      if (errorStatus === 401 || errorStatus === 403) {
        this.logger.error(`⚠️ Error de autenticación - Verifica API Key`);
      }

      if (errorStatus === 404) {
        this.logger.error(`⚠️ Endpoint no encontrado - Verifica que tu plan de ActiveCampaign incluya esta funcionalidad`);
      }

      // Si el error es por dominio no verificado, intentamos con el email de ActiveCampaign por defecto
      if (errorMessage?.toLowerCase().includes('domain') || errorMessage?.toLowerCase().includes('verif')) {
        this.logger.warn(`⚠️ Dominio no verificado. Intentando con email por defecto de ActiveCampaign...`);
        if (contactId) {
          return await this.sendWithDefaultEmail(email, studentName, magicLink, emailHtml, headers, contactId);
        } else {
          // Intentamos obtener el contactId si no lo tenemos
          try {
            const contactUrl = `${this.apiUrl}/api/3/contacts?email=${encodeURIComponent(email)}`;
            const contactResponse = await firstValueFrom(
              this.httpService.get(contactUrl, { headers }),
            );
            const retrievedContactId = contactResponse.data?.contact?.id || contactResponse.data?.contacts?.[0]?.id;
            if (retrievedContactId) {
              return await this.sendWithDefaultEmail(email, studentName, magicLink, emailHtml, headers, retrievedContactId);
            }
          } catch (contactErr) {
            this.logger.error(`❌ No se pudo obtener contactId: ${contactErr}`);
          }
        }
      }

      throw new Error(`Error enviando email: ${errorMessage} (Status: ${errorStatus})`);
    }
  }

  /**
   * Método alternativo: Enviar usando el email por defecto de ActiveCampaign
   * (cuando el dominio no está verificado todavía)
   */
  private async sendWithDefaultEmail(
    email: string,
    studentName: string,
    magicLink: string,
    emailHtml: string,
    headers: any,
    contactId: number,
  ) {
    try {
      this.logger.log(`🔄 Intentando enviar con email por defecto de ActiveCampaign...`);

      // Obtener el email por defecto de ActiveCampaign (puede ser el de la cuenta)
      // Por ahora intentamos sin especificar fromemail para que ActiveCampaign use el por defecto
      const createEmailUrl = `${this.apiUrl}/api/3/emails`;
      const emailPayload = {
        email: {
          name: `Reporte Semanal - ${studentName} - ${Date.now()}`,
          type: 'mime',
          format: 'mime',
          subject: '📊 Tu Reporte Semanal Ya Está Listo',
          html: emailHtml,
          // No especificamos fromemail para que ActiveCampaign use el por defecto
          fromname: 'Yari Taft',
        },
      };

      this.logger.log(`📝 Creando email en ActiveCampaign (sin especificar remitente)...`);
      const emailResponse = await firstValueFrom(
        this.httpService.post(createEmailUrl, emailPayload, { headers }),
      );

      const emailId = emailResponse.data?.email?.id;
      this.logger.log(`✅ Email creado: ID ${emailId}`);

      // Crear y enviar campaña
      const createCampaignUrl = `${this.apiUrl}/api/3/campaigns`;
      const campaignPayload = {
        campaign: {
          type: 'single',
          name: `Reporte Semanal - ${studentName} - ${Date.now()}`,
          sdate: new Date().toISOString(),
          status: 1,
          public: 0,
          tracklinks: 'all',
          trackreads: 1,
          htmlunsub: 1,
          textunsub: 0,
          p: { [String(contactId)]: contactId },
          m: [emailId],
        },
      };

      this.logger.log(`📤 Creando y enviando campaña...`);
      const campaignResponse = await firstValueFrom(
        this.httpService.post(createCampaignUrl, campaignPayload, { headers }),
      );

      const campaignId = campaignResponse.data?.campaign?.id;
      this.logger.log(`✅ Campaña creada y enviada: ID ${campaignId}`);
      this.logger.log(`✅ Email enviado exitosamente a ${email} (usando email por defecto de ActiveCampaign)`);
      this.logger.warn(`⚠️ NOTA: El email se envió desde el remitente por defecto de ActiveCampaign.`);
      this.logger.warn(`⚠️ Para usar hola@yaritaft.com, verifica el dominio en ActiveCampaign.`);

      return {
        success: true,
        data: {
          contactId,
          emailId,
          campaignId,
          message: 'Email enviado usando remitente por defecto de ActiveCampaign',
          warning: 'Dominio no verificado - usando email por defecto',
        },
      };

    } catch (error: any) {
      this.logger.error(`❌ Error incluso con email por defecto: ${error.message}`);
      throw error;
    }
  }
}
