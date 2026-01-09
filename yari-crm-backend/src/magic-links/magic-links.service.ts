import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { GmailService } from '../mail/gmail.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class MagicLinksService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(MagicLinksService.name);
  private frontendUrl: string;

  constructor(
    private nestConfigService: NestConfigService,
    private gmailService: GmailService,
    private systemConfigService: ConfigService,
  ) {
    this.supabase = createClient(
      this.nestConfigService.get<string>('SUPABASE_URL')!,
      this.nestConfigService.get<string>('SUPABASE_KEY')!,
    );
    this.frontendUrl = this.nestConfigService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  async sendLinkToStudent(studentId: number) {
    const { data: student } = await this.supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (!student) throw new BadRequestException('Alumno no encontrado');

    // Obtener configuración para días de expiración
    const config = await this.systemConfigService.getConfig();
    
    const token = uuidv4();
    const today = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(today.getDate() + config.expirationDays);

    const { error } = await this.supabase.from('magic_links').insert({
      student_id: studentId,
      token: token,
      status: 'pending',
      week_start_date: today,
      expires_at: expiresAt,
    });

    if (error) {
      this.logger.error('Error guardando token en DB', error);
      throw new BadRequestException(`Error DB: ${error.message}`);
    }

    const link = `${this.frontendUrl}/report?token=${token}`;

    try {
      const result = await this.gmailService.sendMagicLink(student.email, student.full_name, link);
      this.logger.log(`✅ Email enviado exitosamente a ${student.email}`);
      return {
        success: true,
        message: `Email enviado a ${student.email}`,
        link: link,
        ...result,
      };
    } catch (error: any) {
      this.logger.error(`❌ Error enviando email: ${error.message}`);
      // Aún así retornamos el link generado para que el usuario pueda usarlo
      return {
        success: false,
        message: `Error enviando email: ${error.message}. El link fue generado pero no se pudo enviar.`,
        link: link,
        error: error.message,
      };
    }
  }

  async validateToken(token: string) {
    const { data, error } = await this.supabase
      .from('magic_links')
      .select('*, student:students(*)')
      .eq('token', token)
      .single();

    if (error || !data) {
      return { valid: false, message: 'Token inválido o no encontrado', student: null };
    }

    if (new Date(data.expires_at) < new Date()) {
      return { valid: false, message: 'El enlace ha caducado. Pide uno nuevo.', student: null };
    }

    return { valid: true, data, student: data.student };
  }
}