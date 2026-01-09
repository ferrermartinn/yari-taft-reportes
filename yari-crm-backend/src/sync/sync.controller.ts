import { Controller, Post, Body, Get } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  /**
   * 🔍 VERIFICACIÓN SEGURA: Ver qué se procesaría SIN enviar emails
   */
  @Get('check-before-send')
  async checkBeforeSend() {
    return this.syncService.checkBeforeSend();
  }

  /**
   * 🚀 MIGRACIÓN INICIAL: Envía emails (USAR SOLO DESPUÉS DE VERIFICAR)
   */
  @Post('initial-migration')
  async runInitialMigration() {
    return this.syncService.initialMigration();
  }

  /**
   * 📅 Forzar generación semanal (manual)
   */
  @Post('weekly-reports')
  async forceWeeklyReports() {
    await this.syncService.weeklyReportGeneration();
    return { message: 'Generación semanal ejecutada manualmente' };
  }

  /**
   * 🚨 Forzar verificación de inactividad (manual)
   */
  @Post('check-inactive')
  async forceCheckInactive() {
    await this.syncService.checkInactiveStudents();
    return { message: 'Verificación de inactividad ejecutada' };
  }

  /**
   * 🧪 Generar link de prueba para un email específico
   */
  @Post('test-link')
  async generateTestLink(@Body('email') email: string) {
    if (!email) {
      return { error: 'Email es requerido' };
    }
    return this.syncService.generateTestLink(email);
  }
}