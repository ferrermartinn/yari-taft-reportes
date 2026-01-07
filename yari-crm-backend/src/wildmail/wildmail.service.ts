import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WildmailService {
  private readonly logger = new Logger(WildmailService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly frontendUrl: string;

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiUrl = this.configService.get<string>('WILDMAIL_URL') || '';
    this.apiKey = this.configService.get<string>('WILDMAIL_KEY') || '';
    // Esta es la web donde los alumnos ven el reporte (ej: https://mis-alumnos.com)
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  // 👇 FUNCIÓN NUEVA: Enviar el Link Mágico 🪄
  async sendMagicLink(email: string, studentName: string, token: string) {
    try {
      // 1. Construimos el link completo que el alumno va a cliquear
      // Ejemplo: https://tu-escuela.com/report?token=a1b2c3d4
      const fullLink = `${this.frontendUrl}/report?token=${token}`;

      this.logger.log(`📧 Preparando WildMail para: ${email}`);
      this.logger.debug(`🔗 Link generado: ${fullLink}`);

      // 🛑 IMPORTANTE: Para que WildMail guarde este link, necesitas crear un
      // "Campo Personalizado" en WildMail (ej: "LinkReporteSemanal").
      // Por ahora, pondremos el ID "1" como ejemplo. Luego lo cambiamos por el real.
      const ID_CAMPO_LINK = '1'; // <--- CAMBIAR ESTO LUEGO POR EL ID REAL DE WILDMAIL

      const url = `${this.apiUrl}/api/3/contact/sync`;

      const [firstName, ...rest] = studentName.split(' ');
      const lastName = rest.join(' ');

      const payload = {
        contact: {
          email: email,
          firstName: firstName,
          lastName: lastName,
          // Aquí actualizamos el campo con el link nuevo
          fieldValues: [
            {
              field: ID_CAMPO_LINK, 
              value: fullLink 
            }
          ]
        },
      };

      const headers = {
        'Api-Token': this.apiKey,
        'Content-Type': 'application/json',
      };

      // Enviamos el dato a WildMail
      const { data } = await firstValueFrom(
        this.httpService.post(url, payload, { headers }),
      );

      this.logger.log(`✅ Link enviado a WildMail para ${email} (ID: ${data.contact?.id})`);
      return data;

    } catch (error) {
      this.logger.error(`❌ ERROR WildMail Link: ${error.response?.data?.message || error.message}`);
    }
  }

  // Función para sincronizar contacto (la que ya tenías)
  async sendReportConfirmation(email: string, studentName: string) {
    try {
      this.logger.log(`🔄 Conectando con WildMail para: ${email}...`);
      const url = `${this.apiUrl}/api/3/contact/sync`;
      const [firstName, ...rest] = studentName.split(' ');
      const lastName = rest.join(' ');

      const payload = {
        contact: {
          email: email,
          firstName: firstName,
          lastName: lastName,
        },
      };

      const headers = {
        'Api-Token': this.apiKey,
        'Content-Type': 'application/json',
      };

      const { data } = await firstValueFrom(
        this.httpService.post(url, payload, { headers }),
      );

      this.logger.log(`✅ ÉXITO: Contacto sincronizado (ID: ${data.contact?.id})`);
      return data;

    } catch (error) {
      this.logger.error(`❌ ERROR WildMail: ${error.response?.data?.message || error.message}`);
    }
  }
}