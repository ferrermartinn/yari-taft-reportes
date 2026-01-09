import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerClient } from 'postmark';

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name);
  private readonly postmarkClient: ServerClient | null;
  private readonly fromEmail: string;

  constructor(
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('POSTMARK_API_KEY') || '';
    this.fromEmail = this.configService.get<string>('POSTMARK_FROM_EMAIL') || 'hola@yaritaft.com';
    
    if (!apiKey) {
      this.logger.warn('⚠️ POSTMARK_API_KEY no configurada. Los emails no se enviarán.');
      this.postmarkClient = null;
    } else {
      this.postmarkClient = new ServerClient(apiKey);
      this.logger.log(`✅ Postmark configurado. From: ${this.fromEmail}`);
    }
  }

  async sendMagicLink(email: string, studentName: string, magicLink: string) {
    if (!this.postmarkClient) {
      throw new Error('Postmark no está configurado. Verifica POSTMARK_API_KEY en las variables de entorno.');
    }

    try {
      this.logger.log(`📧 Enviando email a: ${email}`);

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

      const emailText = `Hola ${firstName},\n\nTu reporte de progreso semanal ya está listo. Accede aquí: ${magicLink}\n\n⏰ Importante: Este enlace es válido por 7 días.`;

      // Enviar email con Postmark (mucho más simple)
      const result = await this.postmarkClient.sendEmail({
        From: this.fromEmail,
        To: email,
        Subject: '📊 Tu Reporte Semanal Ya Está Listo',
        HtmlBody: emailHtml,
        TextBody: emailText,
        MessageStream: 'outbound', // Stream para emails transaccionales
      });

      this.logger.log(`✅ Email enviado exitosamente a ${email}`);
      this.logger.log(`📧 MessageID: ${result.MessageID}`);

      return {
        success: true,
        data: {
          messageId: result.MessageID,
          to: result.To,
          submittedAt: result.SubmittedAt,
          message: 'Email enviado exitosamente vía Postmark',
        },
      };

    } catch (error: any) {
      this.logger.error(`❌ ERROR enviando email a ${email}`);
      this.logger.error(`📋 Error: ${error.message}`);
      if (error.stack) {
        this.logger.error(`📋 Stack: ${error.stack}`);
      }
      
      // Postmark proporciona errores más descriptivos
      if (error.ErrorCode) {
        this.logger.error(`📋 ErrorCode: ${error.ErrorCode}`);
        this.logger.error(`📋 Message: ${error.Message}`);
      }
      
      throw new Error(`Error enviando email: ${error.message}`);
    }
  }

}
