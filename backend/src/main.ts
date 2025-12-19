import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 🔥 HABILITA O CORS (Permite que o Frontend delete/crie coisas)
  app.enableCors({
    origin: '*', // Libera para qualquer site (Vercel, Localhost, etc)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Libera o DELETE explicitamente
    allowedHeaders: 'Content-Type, Accept',
  });
  
  await app.listen(process.env.PORT || 3000);
}
bootstrap();