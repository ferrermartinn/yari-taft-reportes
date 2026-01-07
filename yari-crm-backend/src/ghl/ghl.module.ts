import { Module } from '@nestjs/common';
import { GhlService } from './ghl.service';
import { GhlController } from './ghl.controller'; // <--- Verificar importación
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [GhlController], // <--- ¡ESTA LÍNEA ES LA CLAVE QUE FALTABA!
  providers: [GhlService],
  exports: [GhlService],
})
export class GhlModule {}