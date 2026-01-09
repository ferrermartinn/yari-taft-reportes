import { Controller, Get, Post, Body } from '@nestjs/common';
import { ConfigService } from './config.service';
import { SystemConfig } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  async getConfig() {
    return this.configService.getConfig();
  }

  @Post()
  async updateConfig(@Body() config: Partial<SystemConfig>) {
    return this.configService.updateConfig(config);
  }
}
