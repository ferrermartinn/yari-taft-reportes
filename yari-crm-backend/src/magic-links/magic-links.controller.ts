import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { MagicLinksService } from './magic-links.service';

@Controller('magic-links')
export class MagicLinksController {
  constructor(private readonly magicLinksService: MagicLinksService) {}

  // Disparador masivo (Ahora protegido solo para ti)
  @Post('trigger')
  triggerSending() {
    return this.magicLinksService.generateLinksForActiveStudents();
  }

  // Validar el token del link
  @Get('validate')
  validateToken(@Query('token') token: string) {
    return this.magicLinksService.validateToken(token);
  }

  // 👇 El botón "Enviar Manual" ahora sí hace el trabajo real
  @Post('send-one/:id')
  async sendOne(@Param('id') id: string) {
    console.log(`🔌 Solicitud de envío manual para ID: ${id}`);
    return this.magicLinksService.sendLinkToStudent(+id);
  }
}