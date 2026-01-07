import { Controller, Get } from '@nestjs/common';
import { GhlService } from './ghl.service';

@Controller('ghl')
export class GhlController {
  constructor(private readonly ghlService: GhlService) {}

  @Get('test') // Esto crea la ruta: GET /ghl/test
  async testConnection() {
    return await this.ghlService.getContacts();
  }
}