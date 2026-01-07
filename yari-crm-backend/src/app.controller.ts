import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from './mail/mail.service'; // 👈 Importamos el servicio

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService // 👈 Lo inyectamos
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 👇 ESTA ES LA RUTA MÁGICA
  @Get('setup-wildmail')
  async setupWildMail() {
    return this.mailService.createFieldAutomatically();
  }
}