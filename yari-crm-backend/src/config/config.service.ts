import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SystemConfig {
  sendDay: string; // 'monday', 'tuesday', etc.
  sendTime: string; // '09:00'
  frequency: string; // 'weekly', 'biweekly', 'monthly'
  expirationDays: number; // 7
  reminderEnabled: boolean;
  reminderDays: number; // 3
  inactiveDays: number; // 21 - días para marcar como inactivo
  riskDays: number; // 14 - días para marcar como en riesgo
}

@Injectable()
export class ConfigService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(ConfigService.name);
  private defaultConfig: SystemConfig = {
    sendDay: 'monday',
    sendTime: '09:00',
    frequency: 'weekly',
    expirationDays: 7,
    reminderEnabled: true,
    reminderDays: 3,
    inactiveDays: 21,
    riskDays: 14,
  };

  constructor(private nestConfigService: NestConfigService) {
    this.supabase = createClient(
      this.nestConfigService.get<string>('SUPABASE_URL')!,
      this.nestConfigService.get<string>('SUPABASE_KEY')!,
    );
  }

  async getConfig(): Promise<SystemConfig> {
    try {
      const { data, error } = await this.supabase
        .from('system_config')
        .select('*')
        .eq('id', 1)
        .single();

      if (error || !data) {
        // Si no existe, crear con valores por defecto
        return await this.createDefaultConfig();
      }

      return {
        sendDay: data.send_day || this.defaultConfig.sendDay,
        sendTime: data.send_time || this.defaultConfig.sendTime,
        frequency: data.frequency || this.defaultConfig.frequency,
        expirationDays: data.expiration_days || this.defaultConfig.expirationDays,
        reminderEnabled: data.reminder_enabled ?? this.defaultConfig.reminderEnabled,
        reminderDays: data.reminder_days || this.defaultConfig.reminderDays,
        inactiveDays: data.inactive_days || this.defaultConfig.inactiveDays,
        riskDays: data.risk_days || this.defaultConfig.riskDays,
      };
    } catch (error) {
      this.logger.error('Error obteniendo configuración', error);
      return this.defaultConfig;
    }
  }

  async updateConfig(config: Partial<SystemConfig>): Promise<SystemConfig> {
    try {
      const { data, error } = await this.supabase
        .from('system_config')
        .upsert({
          id: 1,
          send_day: config.sendDay,
          send_time: config.sendTime,
          frequency: config.frequency,
          expiration_days: config.expirationDays,
          reminder_enabled: config.reminderEnabled,
          reminder_days: config.reminderDays,
          inactive_days: config.inactiveDays,
          risk_days: config.riskDays,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error actualizando configuración', error);
        throw error;
      }

      return {
        sendDay: data.send_day,
        sendTime: data.send_time,
        frequency: data.frequency,
        expirationDays: data.expiration_days,
        reminderEnabled: data.reminder_enabled,
        reminderDays: data.reminder_days,
        inactiveDays: data.inactive_days,
        riskDays: data.risk_days,
      };
    } catch (error) {
      this.logger.error('Error guardando configuración', error);
      throw error;
    }
  }

  private async createDefaultConfig(): Promise<SystemConfig> {
    try {
      const { data, error } = await this.supabase
        .from('system_config')
        .insert({
          id: 1,
          send_day: this.defaultConfig.sendDay,
          send_time: this.defaultConfig.sendTime,
          frequency: this.defaultConfig.frequency,
          expiration_days: this.defaultConfig.expirationDays,
          reminder_enabled: this.defaultConfig.reminderEnabled,
          reminder_days: this.defaultConfig.reminderDays,
          inactive_days: this.defaultConfig.inactiveDays,
          risk_days: this.defaultConfig.riskDays,
        })
        .select()
        .single();

      if (error) {
        this.logger.warn('No se pudo crear configuración por defecto, usando valores en memoria');
        return this.defaultConfig;
      }

      return this.defaultConfig;
    } catch (error) {
      return this.defaultConfig;
    }
  }
}
