import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service'; 

@Injectable()
export class MagicLinksService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(MagicLinksService.name);

  constructor(
    private configService: ConfigService,
    private mailService: MailService 
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_KEY')!,
    );
  }

  // 1. Enviar Masivo (CON FILTRO DE SEGURIDAD ACTIVADO 🛡️)
  async generateLinksForActiveStudents() {
    this.logger.log('🚀 Iniciando generación masiva (MODO PRUEBA ACTIVADO)...');

    // MODO SEGURO: Filtramos por nombre para que SOLO te llegue a ti.
    const { data: students } = await this.supabase
      .from('students')
      .select('*')
      .eq('status', 'active')
      .ilike('full_name', '%Martin Ferrer%');

    if (!students || students.length === 0) {
      this.logger.warn('⚠️ No se encontró al usuario de prueba (Martín Ferrer) o no está activo.');
      return { message: 'Modo prueba: No se encontraron usuarios coincidentes.' };
    }

    this.logger.log(`🎯 Se enviarán correos a ${students.length} usuarios de prueba.`);

    let count = 0;
    for (const student of students) {
        try {
            await this.sendLinkToStudent(student.id);
            count++;
        } catch (e) {
             this.logger.error(`Error enviando a ${student.full_name}`, e);
        }
    }

    return { success: true, sent_count: count, mode: 'TESTING_ONLY_MARTIN' };
  }

  // 2. Enviar a UN Solo Alumno (Botón Manual)
  async sendLinkToStudent(studentId: number) {
    // A. Buscar datos del alumno
    const { data: student } = await this.supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
        
    if (!student) throw new BadRequestException('Alumno no encontrado');

    // B. Generar Token Único
    const token = uuidv4();

    // C. Calcular Fechas (Inicio y Vencimiento)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7); // Vence en 7 días

    // D. Guardar en Base de Datos (CORREGIDO FINAL ✅)
    const { error } = await this.supabase.from('magic_links').insert({
        student_id: studentId,
        token: token,
        status: 'pending',
        week_start_date: today, // Fecha de hoy
        expires_at: nextWeek    // 👈 Fecha de caducidad (obligatoria)
    });

    if (error) {
        this.logger.error('Error guardando token en DB', error);
        throw new BadRequestException(`Error DB: ${error.message}`);
    }

    // E. Construir el Link
    const link = `http://localhost:3001/report?token=${token}`;

    // F. Enviar a WildMail 🚀
    return this.mailService.sendMagicLink(student.email, link, student.full_name);
  }

  // 3. Validar Token (Cuando el alumno entra al link)
  async validateToken(token: string) {
    const { data, error } = await this.supabase
        .from('magic_links')
        .select('*, student:students(*)')
        .eq('token', token)
        .single();

    if (error || !data) {
        return { valid: false, message: 'Token inválido o no encontrado' };
    }

    // Validar si caducó
    if (new Date(data.expires_at) < new Date()) {
        return { valid: false, message: 'El enlace ha caducado. Pide uno nuevo.' };
    }

    // Validar si ya se usó (opcional, por ahora permitimos reenvíos)
    if (data.status === 'completed') {
       // return { valid: false, message: 'Este reporte ya fue enviado.' };
    }

    return { valid: true, data };
  }
  
  runSetup() {
      return this.mailService.createFieldAutomatically();
  }
}