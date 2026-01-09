import { Controller, Post, Get, Query, Param, BadRequestException } from '@nestjs/common';
import { MagicLinksService } from './magic-links.service';

@Controller('magic-links')
export class MagicLinksController {
  constructor(private readonly magicLinksService: MagicLinksService) {}

  /**
   * Enviar link a un estudiante específico
   */
  @Post('send-one/:id')
  async sendLinkToStudent(@Param('id') id: string) {
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      throw new BadRequestException('ID de estudiante inválido');
    }
    return this.magicLinksService.sendLinkToStudent(studentId);
  }

  /**
   * Validar un token de magic link
   */
  @Get('validate')
  async validateToken(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token es requerido');
    }
    return this.magicLinksService.validateToken(token);
  }
}