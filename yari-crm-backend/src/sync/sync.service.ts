import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { GmailService } from '../mail/gmail.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private supabase: SupabaseClient;
  private frontendUrl: string;

  constructor(
    private gmailService: GmailService,
    private configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_KEY')!,
    );
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  /**
   * 🔍 VERIFICACIÓN PREVIA: NO envía emails, solo verifica
   */
  async checkBeforeSend() {
    this.logger.log('🔍 VERIFICANDO cuántos usuarios se procesarían...');

    try {
      const TEST_EMAIL = 'nahuelmartinferrer@gmail.com';

      const { data: students } = await this.supabase
        .from('students')
        .select('id, email, full_name, status')
        .eq('email', TEST_EMAIL)
        .eq('status', 'active')
        .limit(1);

      if (!students || students.length === 0) {
        this.logger.warn(`⚠️ Usuario ${TEST_EMAIL} no encontrado`);
        return {
          success: false,
          message: `Usuario ${TEST_EMAIL} no encontrado en Supabase`,
          count: 0,
          users: [],
        };
      }

      this.logger.log(`✅ Verificación completada: ${students.length} usuario(s)`);

      return {
        success: true,
        message: '⚠️ ESTO ES SOLO VERIFICACIÓN - No se envió ningún email',
        count: students.length,
        users: students.map(s => ({
          email: s.email,
          name: s.full_name,
          status: s.status,
        })),
        warning: 'Si ejecutas /sync/initial-migration se enviará email a estos usuarios',
      };

    } catch (error) {
      this.logger.error(`❌ Error en verificación: ${error.message}`);
      throw error;
    }
  }

  /**
   * 🧪 MODO PRUEBA: Solo envía a UN email específico
   */
  async initialMigration() {
    this.logger.log('🧪 MODO PRUEBA ACTIVADO - Solo se enviará a tu email');

    try {
      const TEST_EMAIL = 'nahuelmartinferrer@gmail.com';

      const { data: students } = await this.supabase
        .from('students')
        .select('id, email, full_name')
        .eq('email', TEST_EMAIL)
        .eq('status', 'active')
        .limit(1);

      if (!students || students.length === 0) {
        this.logger.warn(`⚠️ No se encontró el usuario: ${TEST_EMAIL}`);
        return { 
          success: false, 
          message: `Usuario ${TEST_EMAIL} no encontrado en Supabase. Verifica que exista y esté activo.` 
        };
      }

      const student = students[0];
      this.logger.log(`👤 Usuario de prueba: ${student.email}`);

      try {
        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.supabase.from('magic_links').insert({
          student_id: student.id,
          token: token,
          status: 'pending',
          week_start_date: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        });

        const magicLink = `${this.frontendUrl}/report?token=${token}`;

        this.logger.log(`📧 Enviando email de prueba a: ${student.email}`);
        this.logger.log(`🔗 Magic Link: ${magicLink}`);

        await this.gmailService.sendMagicLink(
          student.email,
          student.full_name,
          magicLink,
        );

        this.logger.log('✅ Email de prueba enviado exitosamente');

        return {
          success: true,
          message: 'Email de prueba enviado',
          email: student.email,
          magicLink: magicLink,
          token: token,
        };

      } catch (error) {
        this.logger.error(`❌ Error enviando email: ${error.message}`);
        throw error;
      }

    } catch (error) {
      this.logger.error(`❌ Error general: ${error.message}`);
      throw error;
    }
  }

  /**
   * 🔄 CRON JOB SEMANAL - DESHABILITADO
   */
  // @Cron('0 9 * * 1')
  async weeklyReportGeneration() {
    this.logger.warn('⚠️ CRON JOB DESHABILITADO - No se ejecutará automáticamente');
    return;
  }

  /**
   * 🚨 VERIFICACIÓN DE INACTIVIDAD - DESHABILITADO
   */
  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkInactiveStudents() {
    this.logger.warn('⚠️ CRON JOB DESHABILITADO - No se ejecutará automáticamente');
    return;
  }

  /**
   * 🧪 TEST: Generar link para un email específico
   */
  async generateTestLink(email: string) {
    try {
      const { data: student } = await this.supabase
        .from('students')
        .select('*')
        .eq('email', email)
        .single();

      if (!student) {
        throw new Error(`Usuario no encontrado: ${email}`);
      }

      const token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await this.supabase.from('magic_links').insert({
        student_id: student.id,
        token: token,
        status: 'pending',
        week_start_date: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      });

      const magicLink = `${this.frontendUrl}/report?token=${token}`;

      await this.gmailService.sendMagicLink(
        student.email,
        student.full_name,
        magicLink,
      );

      this.logger.log(`✅ Link de prueba generado para ${email}`);

      return { success: true, magicLink, token };
    } catch (error) {
      this.logger.error(`❌ Error generando link de prueba: ${error.message}`);
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}