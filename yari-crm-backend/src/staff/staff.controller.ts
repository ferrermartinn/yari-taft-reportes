import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { StaffService } from './staff.service';

interface CreateStaffDto {
  email: string;
  password: string;
  full_name: string;
}

interface UpdateStaffDto {
  full_name?: string;
  password?: string;
}

interface LoginDto {
  email: string;
  password: string;
}

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(
      createStaffDto.email,
      createStaffDto.password,
      createStaffDto.full_name,
    );
  }

  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(+id, updateStaffDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(+id);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.staffService.login(loginDto.email, loginDto.password);
  }
}
