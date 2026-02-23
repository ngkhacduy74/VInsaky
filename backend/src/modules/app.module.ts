import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth.module';
import { AuthService } from '../services/auth.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { LoggerMiddleware } from '../middleware/logging.middleware';
import { TransformInterceptor } from '../interceptors/response.interceptor';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { AuthController } from '../controllers/auth.controller';
import { UserModule } from './user.module';
import { UploadsModule } from './upload.module';
import { ProductModule } from './product.module';
import { DashboardModule } from './dasboard.module';
import { PostModule } from './post.module';
import { OrdersModule } from './order.module';
import { MailModule } from './mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DB_URL'),
      }),
    }),
    // ThrottlerModule.forRoot({
    //   throttlers: [
    //     {
    //       ttl: 60_000,
    //       limit: 10,
    //     },
    //   ],
    // }),
    AuthModule,
    UserModule,
    UploadsModule,
    ProductModule,
    DashboardModule,
    PostModule,MailModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
