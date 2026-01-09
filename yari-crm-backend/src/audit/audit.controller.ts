import { Controller, Get } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async getFullAudit() {
    return this.auditService.getFullAudit();
  }

  @Get('links')
  async getLinksAudit() {
    return this.auditService.getLinksAudit();
  }
}
