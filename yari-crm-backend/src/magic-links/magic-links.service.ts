import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { GmailService } from '../mail/gmail.service';

@Injectable()
export class MagicLinksService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(MagicLinksService.name);

  constructor(
    private configService: ConfigService,
    private gmailService: GmailService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_KEY')!,
    );
  }

  async sendLinkToStudent(studentId: number) {
    const { data: student } = await this.supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (!student) throw new BadRequestException('Alumno no encontrado');

    const token = uuidv4();
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const { error } = await this.supabase.from('magic_links').insert({
      student_id: studentId,
      token: token,
      status: 'pending',
      week_start_date: today,
      expires_at: nextWeek,
    });

    if (error) {
      this.logger.error('Error guardando token en DB', error);
      throw new BadRequestException(`Error DB: ${error.message}`);
    }

    const link = `http://localhost:3001/report?token=${token}`;

    return this.gmailService.sendMagicLink(student.email, student.full_name, link);
  }

  async validateToken(token: string) {
    const { data, error } = await this.supabase
      .from('magic_links')
      .select('*, student:students(*)')
      .eq('token', token)
      .single();

    if (error || !data) {
      return { valid: false, message: 'Token inválido o no encontrado' };
    }

    if (new Date(data.expires_at) < new Date()) {
      return { valid: false, message: 'El enlace ha caducado. Pide uno nuevo.' };
    }

    return { valid: true, data };
  }
}