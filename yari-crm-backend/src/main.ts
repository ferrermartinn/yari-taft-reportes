import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 ESTO ES LO QUE TE FALTA (Permitir conexión desde el Frontend)
  app.enableCors({
    origin: '*', // En producción esto debería ser tu dominio real, pero para desarrollo '*' está bien.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Habilitar validaciones globales (para que funcionen los @IsString, etc.)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina datos extra que no estén en el DTO
    forbidNonWhitelisted: false, // No da error si envías datos de más, solo los ignora (más seguro ahora)
  }));

app.enableCors({
  origin: 'http://localhost:3001', // o el puerto que uses en el frontend
  credentials: true,
});

  await app.listen(3000);
  console.log('🚀 Backend corriendo en http://localhost:3000');
}
bootstrap();