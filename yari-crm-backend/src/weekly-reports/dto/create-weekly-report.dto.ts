import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateWeeklyReportDto {
  @IsNotEmpty()
  @IsString()
  token: string; // 🔑 La única llave que necesitamos

  @IsNotEmpty()
  answers: any; // 📦 Aquí dentro viajan todas tus métricas (productivity, interviews, etc.)
}