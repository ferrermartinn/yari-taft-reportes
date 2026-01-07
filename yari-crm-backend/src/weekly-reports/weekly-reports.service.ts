import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class WeeklyReportsService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(WeeklyReportsService.name);

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_KEY')!,
    );
  }

  // 1. Guardar reporte (sin cambios)
  async create(body: any) {
    const { token, answers } = body;
    
    // Buscar link
    const { data: linkData, error: linkError } = await this.supabase
      .from('magic_links')
      .select('student_id')
      .eq('token', token)
      .single();

    if (linkError || !linkData) throw new BadRequestException('Token inválido');

    // Guardar reporte
    const { data, error } = await this.supabase
      .from('weekly_reports')
      .insert({
        student_id: linkData.student_id,
        answers: answers,
        week_start: new Date(),
      })
      .select()
      .single();

    if (error) {
        this.logger.error('Error guardando reporte', error);
        throw new BadRequestException(error.message);
    }

    return data;
  }

  // 2. Traer reportes de UN alumno (AQUÍ ESTÁ EL CAMBIO) 👈
  async findByStudent(studentId: number) {
    // Aseguramos que sea número
    const id = Number(studentId);
    if (isNaN(id)) {
        throw new BadRequestException('ID de alumno inválido');
    }

    const { data, error } = await this.supabase
      .from('weekly_reports')
      .select('*')
      .eq('student_id', id)
      .order('created_at', { ascending: false });

    if (error) {
        this.logger.error(`Error buscando reportes para alumno ${id}`, error);
        // Si la tabla no existe o falla algo grave, devolvemos array vacío para no romper el frontend
        // Pero logueamos el error para que tú lo veas
        return []; 
    }
    
    return data || [];
  }

  // 3. Traer TODOS los reportes (Auditoría)
  async findAll() {
    // Intentamos traer la relación con student. 
    // Si falla, traemos solo reportes para que no explote.
    const { data, error } = await this.supabase
      .from('weekly_reports')
      .select('*, student:students(full_name, email)') 
      .order('created_at', { ascending: false });

    if (error) {
        this.logger.error('Error en findAll reports', error);
        // Si falla la relación, intentamos traer sin relación
        const { data: dataSimple } = await this.supabase
            .from('weekly_reports')
            .select('*')
            .order('created_at', { ascending: false });
        return dataSimple || [];
    }
    return data;
  }
}