import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(StudentsService.name);

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_KEY')!,
    );
  }

  // 1. Crear nuevo alumno
  async create(createStudentDto: CreateStudentDto) {
    const { data, error } = await this.supabase
      .from('students')
      .insert({
        ...createStudentDto,
        status: 'active', // Por defecto nacen activos
        created_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Error creando alumno: ${error.message}`);
      throw new BadRequestException(error.message);
    }
    return data;
  }

  // 2. Listar TODOS los alumnos (para tu tabla gigante)
  async findAll() {
    const { data, error } = await this.supabase
      .from('students')
      .select('*')
      .order('full_name', { ascending: true }); // Ordenados alfabéticamente

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // 3. Buscar UNO solo (para la ficha técnica)
  async findOne(id: number) {
    const { data, error } = await this.supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException(`Alumno #${id} no encontrado`);
    return data;
  }

  // 4. Actualizar datos (Editar nombre, mail, etc.)
  async update(id: number, updateStudentDto: UpdateStudentDto) {
    const { data, error } = await this.supabase
      .from('students')
      .update(updateStudentDto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // 5. Eliminar (o desactivar)
  async remove(id: number) {
    const { error } = await this.supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);
    return { message: `Alumno #${id} eliminado correctamente` };
  }
}