import { Injectable, BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(StaffService.name);

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_KEY')!,
    );
  }

  async create(email: string, password: string, fullName: string) {
    // Verificar que el email no exista
    const { data: existing } = await this.supabase
      .from('staff')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      throw new BadRequestException('Este email ya está registrado');
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear staff
    const { data, error } = await this.supabase
      .from('staff')
      .insert({
        email: email.toLowerCase(),
        password: hashedPassword,
        full_name: fullName,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creando staff', error);
      throw new BadRequestException(`Error al crear staff: ${error.message}`);
    }

    // No devolver la contraseña
    const { password: _, ...staffWithoutPassword } = data;
    return staffWithoutPassword;
  }

  async findAll() {
    const { data, error } = await this.supabase
      .from('staff')
      .select('id, email, full_name, created_at, last_login_at')
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Error obteniendo staff', error);
      return [];
    }

    return data || [];
  }

  async findOne(id: number) {
    const { data, error } = await this.supabase
      .from('staff')
      .select('id, email, full_name, created_at, last_login_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new BadRequestException('Staff no encontrado');
    }

    return data;
  }

  async update(id: number, updates: { full_name?: string; password?: string }) {
    const updateData: any = {};

    if (updates.full_name) {
      updateData.full_name = updates.full_name;
    }

    if (updates.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updates.password, saltRounds);
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No hay campos para actualizar');
    }

    const { data, error } = await this.supabase
      .from('staff')
      .update(updateData)
      .eq('id', id)
      .select('id, email, full_name, created_at, last_login_at')
      .single();

    if (error) {
      this.logger.error('Error actualizando staff', error);
      throw new BadRequestException(`Error al actualizar: ${error.message}`);
    }

    return data;
  }

  async remove(id: number) {
    const { error } = await this.supabase
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error eliminando staff', error);
      throw new BadRequestException(`Error al eliminar: ${error.message}`);
    }

    return { message: 'Staff eliminado correctamente' };
  }

  async login(email: string, password: string) {
    const { data: staff, error } = await this.supabase
      .from('staff')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !staff) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, staff.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Actualizar último login
    await this.supabase
      .from('staff')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', staff.id);

    // No devolver la contraseña
    const { password: _, ...staffWithoutPassword } = staff;
    return staffWithoutPassword;
  }
}
