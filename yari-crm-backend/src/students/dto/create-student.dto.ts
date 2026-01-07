import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  // 👇 ESTOS SON LOS IMPORTANTES PARA QUE NO DE ERROR
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  telegram_id?: string;
}