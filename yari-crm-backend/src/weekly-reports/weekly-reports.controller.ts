import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { WeeklyReportsService } from './weekly-reports.service';

@Controller('weekly-reports')
export class WeeklyReportsController {
  constructor(private readonly weeklyReportsService: WeeklyReportsService) {}

  @Post()
  create(@Body() body: any) {
    return this.weeklyReportsService.create(body);
  }

  @Get()
  findAll() {
    return this.weeklyReportsService.findAll();
  }

  @Get('student/:id')
  findByStudent(@Param('id') id: string) {
    return this.weeklyReportsService.findByStudent(+id);
  }
}