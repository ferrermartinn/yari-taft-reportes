import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { GmailService } from '../mail/gmail.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private supabase: SupabaseClient;
  private frontendUrl: string;

  constructor(
    private gmailService: GmailService,
    private nestConfigService: NestConfigService,
    private systemConfigService: ConfigService,
  ) {
    this.supabase = createClient(
      this.nestConfigService.get<string>('SUPABASE_URL')!,
      this.nestConfigService.get<string>('SUPABASE_KEY')!,
    );
    this.frontendUrl = this.nestConfigService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  /**
   * 🔄 CRON JOB SEMANAL - Envía formularios cada 7 días
   * Se ejecuta todos los lunes a las 9:00 AM (configurable)
   */
  @Cron('0 9 * * 1') // Lunes a las 9:00 AM - se puede cambiar desde config
  async weeklyReportGeneration() {
    this.logger.log('🔄 Iniciando envío semanal de formularios...');
    
    try {
      const config = await this.systemConfigService.getConfig();
      
      // Verificar si es el día correcto (por ahora solo lunes, pero se puede expandir)
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = domingo, 1 = lunes, etc.
      const dayMap: { [key: string]: number } = {
        'sunday': 0,
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6,
      };
      
      const expectedDay = dayMap[config.sendDay] ?? 1; // default lunes
      if (dayOfWeek !== expectedDay) {
        this.logger.log(`⏭️ No es el día configurado (${config.sendDay}), saltando...`);
        return;
      }

      // Obtener todos los estudiantes activos
      const { data: students, error } = await this.supabase
        .from('students')
        .select('id, email, full_name, status')
        .eq('status', 'active');

      if (error) {
        this.logger.error('❌ Error obteniendo estudiantes', error);
        return;
      }

      if (!students || students.length === 0) {
        this.logger.log('ℹ️ No hay estudiantes activos para enviar');
        return;
      }

      this.logger.log(`📧 Enviando formularios a ${students.length} estudiantes...`);

      let successCount = 0;
      let errorCount = 0;

      for (const student of students) {
        try {
          // Generar token único
          const token = uuidv4();
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + config.expirationDays);

          // Guardar magic link
          const { error: linkError } = await this.supabase
            .from('magic_links')
            .insert({
              student_id: student.id,
              token: token,
              status: 'pending',
              week_start_date: new Date().toISOString(),
              expires_at: expiresAt.toISOString(),
            });

          if (linkError) {
            this.logger.error(`❌ Error guardando link para ${student.email}: ${linkError.message}`);
            errorCount++;
            continue;
          }

          // Enviar email
          const magicLink = `${this.frontendUrl}/report?token=${token}`;
          await this.gmailService.sendMagicLink(
            student.email,
            student.full_name,
            magicLink,
          );

          successCount++;
          this.logger.log(`✅ Enviado a ${student.email}`);

          // Pequeña pausa para no saturar
          await this.sleep(500);
        } catch (error) {
          this.logger.error(`❌ Error enviando a ${student.email}: ${error.message}`);
          errorCount++;
        }
      }

      this.logger.log(`✅ Envío semanal completado: ${successCount} éxitos, ${errorCount} errores`);
    } catch (error) {
      this.logger.error(`❌ Error en envío semanal: ${error.message}`);
    }
  }

  /**
   * 🚨 VERIFICACIÓN DIARIA DE INACTIVIDAD
   * Verifica cada día a medianoche y marca como inactivos los que pasaron 21 días
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkInactiveStudents() {
    this.logger.log('🚨 Verificando estudiantes inactivos...');
    
    try {
      const config = await this.systemConfigService.getConfig();
      const now = new Date();
      
      // Obtener todos los estudiantes activos o en riesgo
      const { data: students, error } = await this.supabase
        .from('students')
        .select('id, email, full_name, status, last_interaction_at')
        .in('status', ['active', 'at_risk']);

      if (error) {
        this.logger.error('❌ Error obteniendo estudiantes', error);
        return;
      }

      if (!students || students.length === 0) {
        this.logger.log('ℹ️ No hay estudiantes para verificar');
        return;
      }

      let updatedCount = 0;

      for (const student of students) {
        if (!student.last_interaction_at) {
          // Si nunca ha enviado un reporte, verificar desde created_at
          const { data: studentData } = await this.supabase
            .from('students')
            .select('created_at')
            .eq('id', student.id)
            .single();

          if (studentData?.created_at) {
            const daysSince = Math.floor(
              (now.getTime() - new Date(studentData.created_at).getTime()) / (1000 * 60 * 60 * 24)
            );
            
            if (daysSince >= config.inactiveDays) {
              await this.updateStudentStatus(student.id, 'inactive');
              updatedCount++;
              this.logger.log(`⚠️ ${student.email} marcado como inactivo (${daysSince} días sin reporte)`);
            }
          }
          continue;
        }

        const daysSince = Math.floor(
          (now.getTime() - new Date(student.last_interaction_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Si pasaron 21 días o más, marcar como inactivo
        if (daysSince >= config.inactiveDays) {
          await this.updateStudentStatus(student.id, 'inactive');
          updatedCount++;
          this.logger.log(`⚠️ ${student.email} marcado como inactivo (${daysSince} días sin reporte)`);
        }
        // Si pasaron 14 días pero menos de 21, marcar como en riesgo
        else if (daysSince >= config.riskDays && student.status !== 'at_risk') {
          await this.updateStudentStatus(student.id, 'at_risk');
          this.logger.log(`⚠️ ${student.email} marcado como en riesgo (${daysSince} días sin reporte)`);
        }
      }

      this.logger.log(`✅ Verificación completada: ${updatedCount} estudiantes actualizados`);
    } catch (error) {
      this.logger.error(`❌ Error en verificación de inactividad: ${error.message}`);
    }
  }

  /**
   * Actualizar estado de estudiante y recalcular si tiene fallos
   */
  private async updateStudentStatus(studentId: number, newStatus: string) {
    // Verificar si el estudiante tiene reportes faltantes (fallos)
    const { data: reports } = await this.supabase
      .from('weekly_reports')
      .select('created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Si tiene reportes pero hay gaps, marcar con indicador de fallo
    let hasFailures = false;
    if (reports && reports.length > 0) {
      // Verificar si hay gaps de más de 7 días entre reportes
      for (let i = 0; i < reports.length - 1; i++) {
        const daysBetween = Math.floor(
          (new Date(reports[i].created_at).getTime() - new Date(reports[i + 1].created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysBetween > 14) {
          hasFailures = true;
          break;
        }
      }
    }

    const statusToSet = hasFailures && newStatus === 'active' ? 'active_with_failure' : newStatus;

    await this.supabase
      .from('students')
      .update({ 
        status: statusToSet,
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentId);
  }

  /**
   * 🔍 VERIFICACIÓN PREVIA: NO envía emails, solo verifica
   */
  async checkBeforeSend() {
    this.logger.log('🔍 VERIFICANDO cuántos usuarios se procesarían...');

    try {
      const { data: students } = await this.supabase
        .from('students')
        .select('id, email, full_name, status')
        .eq('status', 'active');

      if (!students || students.length === 0) {
        return {
          success: false,
          message: 'No hay estudiantes activos',
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
        warning: 'Si ejecutas /sync/weekly-reports se enviará email a estos usuarios',
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
      const config = await this.systemConfigService.getConfig();
      
      const token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + config.expirationDays);

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
      this.logger.error(`❌ Error general: ${error.message}`);
      throw error;
    }
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

      const config = await this.systemConfigService.getConfig();
      const token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + config.expirationDays);

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
