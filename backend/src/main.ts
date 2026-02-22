import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https:'],
        },
      },
    }),
  );
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:4000',
    'https://exe-frontend-ou98.onrender.com',
    'https://vinsaky.com',
    'https://www.vinsaky.com',
    'https://exe-08k7.onrender.com',
  ];

  const isProduction = process.env.NODE_ENV === 'production';

  app.enableCors({
    // origin: (origin, callback) => {
    //   if (!origin) return callback(null, true);

    //   if (allowedOrigins.includes(origin)) return callback(null, true);

    //   if (isProduction && origin.endsWith('.onrender.com')) {
    //     return callback(null, true);
    //   }

    //   return callback(new Error('Not allowed by CORS'), false);
    // },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'token',
      'authorization',
      'x-access-token',
      'Origin',
      'Accept',
      'X-Requested-With',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

 const port = process.env.PORT || 3000;

await app.listen(port, '0.0.0.0');
}
bootstrap();
