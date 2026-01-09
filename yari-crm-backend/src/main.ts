import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Obtener puerto desde variable de entorno o usar 3000 por defecto
  const port = configService.get<number>('PORT') || 3000;
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  // Configurar CORS dinámicamente según entorno
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  const allowedOrigins = nodeEnv === 'production'
    ? [frontendUrl] // En producción solo el dominio configurado
    : ['http://localhost:3000', 'http://localhost:3001', frontendUrl]; // En desarrollo permite localhost

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Habilitar validaciones globales
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
  }));

  await app.listen(port);
  console.log(`🚀 Backend corriendo en http://localhost:${port}`);
  console.log(`📦 Entorno: ${nodeEnv}`);
  console.log(`🌐 CORS permitido para: ${allowedOrigins.join(', ')}`);
}
bootstrap();