import { Module } from '@nestjs/common';
import { AuthService } from 'src/services/auth.service';
import { AuthAbstract } from 'src/abstracts/services/auth.abstract';
import { AuthController } from 'src/controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';

import { UserModule } from './user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from './rabbitmq.module';
import { BullModule } from '@nestjs/bullmq';
import { BullMQService } from 'src/services/bullmq.service';
import { BullMQModule } from './bullmq.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '30m' },
      }),
      inject: [ConfigService],
    }),
    BullMQModule,
    UserModule,
    RabbitMQModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: AuthAbstract,
      useExisting: AuthService,
    },
  ],
  exports: [AuthAbstract, JwtModule],
})
export class AuthModule {}
