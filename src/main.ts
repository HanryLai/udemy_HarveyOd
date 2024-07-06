import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);
   app.useGlobalPipes(
      new ValidationPipe({
         whitelist: true,
         transformOptions: { enableImplicitConversion: true },
      }),
   );

   app.use(helmet());

   const globalPrefix = 'api';
   app.setGlobalPrefix(globalPrefix);

   app.enableCors();

   const configSwagger = new DocumentBuilder()
      .setTitle('API Products')
      .setDescription('API Products description')
      .setVersion('1.0')
      .addTag('products')
      .build();
   const document = SwaggerModule.createDocument(app, configSwagger);
   SwaggerModule.setup('api', app, document);

   const configService = app.get(ConfigService);
   const port = configService.get<string>('PORT') || 3000;
   await app.listen(port, () => {
      console.log('Listening at ');
   });
}

bootstrap();
