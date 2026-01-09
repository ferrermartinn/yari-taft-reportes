import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuditService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(AuditService.name);

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_KEY')!,
    );
  }

  /**
   * Obtener auditoría completa: envíos, links, reportes
   */
  async getFullAudit() {
    try {
      // Obtener todos los magic links con información del estudiante
      const { data: links, error: linksError } = await this.supabase
        .from('magic_links')
        .select('*, student:students(full_name, email)')
        .order('created_at', { ascending: false });

      // Obtener todos los reportes con información del estudiante
      const { data: reports, error: reportsError } = await this.supabase
        .from('weekly_reports')
        .select('*, student:students(full_name, email)')
        .order('created_at', { ascending: false });

      // Obtener todos los estudiantes con su estado actual
      const { data: students, error: studentsError } = await this.supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      // Obtener reportes fallidos (links expirados o pendientes que no se completaron)
      const failedReports = (links || []).filter(link => {
        const isExpired = new Date(link.expires_at) < new Date();
        const isPending = link.status === 'pending';
        // Un link fallido es uno que expiró o está pendiente y no tiene un reporte completado
        if (link.status === 'completed') return false;
        return (isExpired || isPending);
      });

      return {
        links: links || [],
        reports: reports || [],
        failedReports: failedReports || [],
        students: students || [],
        stats: {
          totalLinks: links?.length || 0,
          totalReports: reports?.length || 0,
          totalStudents: students?.length || 0,
          pendingLinks: links?.filter(l => l.status === 'pending').length || 0,
          completedLinks: links?.filter(l => l.status === 'completed').length || 0,
          expiredLinks: links?.filter(l => new Date(l.expires_at) < new Date()).length || 0,
          failedReports: failedReports?.length || 0,
        },
      };
    } catch (error) {
      this.logger.error('Error obteniendo auditoría', error);
      throw error;
    }
  }

  /**
   * Obtener solo los envíos (magic links)
   */
  async getLinksAudit() {
    try {
      const { data, error } = await this.supabase
        .from('magic_links')
        .select('*, student:students(full_name, email)')
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('Error obteniendo links', error);
        return [];
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error en getLinksAudit', error);
      return [];
    }
  }
}
