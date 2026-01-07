import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// 👇 Importamos tus módulos
import { StudentsModule } from './students/students.module';
import { MagicLinksModule } from './magic-links/magic-links.module';
import { WeeklyReportsModule } from './weekly-reports/weekly-reports.module';
import { MailModule } from './mail/mail.module'; // 👈 NUEVO

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Tu config de .env
    StudentsModule, 
    MagicLinksModule, 
    WeeklyReportsModule,
    MailModule, // 👈 AGREGADO AQUÍ
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}