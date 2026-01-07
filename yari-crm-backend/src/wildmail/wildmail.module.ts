import { Module } from '@nestjs/common';
import { WildmailService } from './wildmail.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios'; // <--- Nueva herramienta

@Module({
  imports: [
    ConfigModule, 
    HttpModule // <--- Importamos el módulo HTTP para hacer llamadas externas
  ],
  providers: [WildmailService],
  exports: [WildmailService],
})
export class WildmailModule {}