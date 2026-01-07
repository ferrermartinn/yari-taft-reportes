import { PartialType } from '@nestjs/mapped-types';
import { CreateWeeklyReportDto } from './create-weekly-report.dto';

export class UpdateWeeklyReportDto extends PartialType(CreateWeeklyReportDto) {}
