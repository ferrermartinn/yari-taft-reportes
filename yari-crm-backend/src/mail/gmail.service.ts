import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ServerClient } from 'postmark';

type EmailProvider = 'postmark' | 'activecampaign';

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name);
  private readonly provider: EmailProvider | null;
  private readonly postmarkClient: ServerClient | null;
  private readonly activeCampaignApiUrl: string;
  private readonly activeCampaignApiKey: string;
  private readonly fromEmail: string;

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    // Detectar qué proveedor está configurado
    const postmarkKey = this.configService.get<string>('POSTMARK_API_KEY') || '';
    const activeCampaignKey = this.configService.get<string>('WILDMAIL_API_KEY') || '';
    const activeCampaignUrl = this.configService.get<string>('WILDMAIL_API_URL') || 'https://yaritaft.api-us1.com';
    
    this.fromEmail = this.configService.get<string>('POSTMARK_FROM_EMAIL') || 
                     this.configService.get<string>('WILDMAIL_FROM_EMAIL') || 
                     'hola@yaritaft.com';

    // Prioridad: Postmark > ActiveCampaign
    if (postmarkKey) {
      this.provider = 'postmark';
      this.postmarkClient = new ServerClient(postmarkKey);
      this.activeCampaignApiKey = '';
      this.activeCampaignApiUrl = '';
      this.logger.log(`✅ Postmark configurado. From: ${this.fromEmail}`);
    } else if (activeCampaignKey) {
      this.provider = 'activecampaign';
      this.postmarkClient = null;
      this.activeCampaignApiKey = activeCampaignKey;
      this.activeCampaignApiUrl = activeCampaignUrl;
      this.logger.log(`✅ ActiveCampaign configurado. From: ${this.fromEmail}`);
    } else {
      this.provider = null;
      this.postmarkClient = null;
      this.activeCampaignApiKey = '';
      this.activeCampaignApiUrl = '';
      this.logger.warn('⚠️ No hay proveedor de email configurado. Configura POSTMARK_API_KEY o WILDMAIL_API_KEY.');
    }
  }

  async sendMagicLink(email: string, studentName: string, magicLink: string) {
    if (!this.provider) {
      throw new Error('No hay proveedor de email configurado. Configura POSTMARK_API_KEY o WILDMAIL_API_KEY.');
    }

    const firstName = studentName.split(' ')[0];
    const emailHtml = this.getEmailHtml(firstName, magicLink);
    const emailText = `Hola ${firstName},\n\nTu reporte de progreso semanal ya está listo. Accede aquí: ${magicLink}\n\n⏰ Importante: Este enlace es válido por 7 días.`;

    if (this.provider === 'postmark') {
      return await this.sendViaPostmark(email, emailHtml, emailText);
    } else {
      return await this.sendViaActiveCampaign(email, studentName, magicLink, emailHtml);
    }
  }

  private async sendViaPostmark(email: string, emailHtml: string, emailText: string) {
    if (!this.postmarkClient) {
      throw new Error('Postmark no está configurado correctamente.');
    }

    try {
      this.logger.log(`📧 Enviando email vía Postmark a: ${email}`);
      
      const result = await this.postmarkClient.sendEmail({
        From: this.fromEmail,
        To: email,
        Subject: '📊 Tu Reporte Semanal Ya Está Listo',
        HtmlBody: emailHtml,
        TextBody: emailText,
        MessageStream: 'outbound',
      });

      this.logger.log(`✅ Email enviado exitosamente a ${email} (Postmark)`);
      return {
        success: true,
        data: {
          messageId: result.MessageID,
          to: result.To,
          submittedAt: result.SubmittedAt,
          provider: 'postmark',
          message: 'Email enviado exitosamente vía Postmark',
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ ERROR enviando email vía Postmark: ${error.message}`);
      if (error.ErrorCode) {
        this.logger.error(`📋 ErrorCode: ${error.ErrorCode}, Message: ${error.Message}`);
      }
      throw new Error(`Error enviando email: ${error.message}`);
    }
  }

  private async sendViaActiveCampaign(email: string, studentName: string, magicLink: string, emailHtml: string) {
    try {
      this.logger.log(`📧 Enviando email vía ActiveCampaign a: ${email}`);

      const headers = {
        'Api-Token': this.activeCampaignApiKey,
        'Content-Type': 'application/json',
      };

      // Crear o obtener contacto
      let contactId: number;
      try {
        const contactUrl = `${this.activeCampaignApiUrl}/api/3/contacts`;
        const contactPayload = {
          contact: {
            email: email,
            firstName: studentName.split(' ')[0],
            lastName: studentName.split(' ').slice(1).join(' ') || '',
          },
        };

        let contactResponse;
        try {
          contactResponse = await firstValueFrom(
            this.httpService.post(contactUrl, contactPayload, { headers }),
          );
        } catch (contactError: any) {
          if (contactError.response?.status === 422) {
            const getContactUrl = `${this.activeCampaignApiUrl}/api/3/contacts?email=${encodeURIComponent(email)}`;
            contactResponse = await firstValueFrom(
              this.httpService.get(getContactUrl, { headers }),
            );
          } else {
            throw contactError;
          }
        }

        contactId = contactResponse.data?.contact?.id || contactResponse.data?.contacts?.[0]?.id;
        if (!contactId) throw new Error('No se pudo obtener contactId');
      } catch (error: any) {
        this.logger.error(`❌ Error creando/obteniendo contacto: ${error.message}`);
        throw error;
      }

      // Crear email
      const createEmailUrl = `${this.activeCampaignApiUrl}/api/3/emails`;
      const emailPayload = {
        email: {
          name: `Reporte Semanal - ${studentName} - ${Date.now()}`,
          type: 'mime',
          format: 'mime',
          subject: '📊 Tu Reporte Semanal Ya Está Listo',
          html: emailHtml,
          fromemail: this.fromEmail,
          fromname: 'Yari Taft',
        },
      };

      const emailResponse = await firstValueFrom(
        this.httpService.post(createEmailUrl, emailPayload, { headers }),
      );
      const emailId = emailResponse.data?.email?.id;

      // Crear y enviar campaña
      const createCampaignUrl = `${this.activeCampaignApiUrl}/api/3/campaigns`;
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

      const campaignResponse = await firstValueFrom(
        this.httpService.post(createCampaignUrl, campaignPayload, { headers }),
      );
      const campaignId = campaignResponse.data?.campaign?.id;

      this.logger.log(`✅ Email enviado exitosamente a ${email} (ActiveCampaign)`);
      return {
        success: true,
        data: {
          contactId,
          emailId,
          campaignId,
          provider: 'activecampaign',
          message: 'Email enviado exitosamente vía ActiveCampaign',
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ ERROR enviando email vía ActiveCampaign: ${error.message}`);
      if (error.response) {
        this.logger.error(`📋 Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`Error enviando email: ${error.message}`);
    }
  }

  private getEmailHtml(firstName: string, magicLink: string): string {
    return `
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
  }

}
