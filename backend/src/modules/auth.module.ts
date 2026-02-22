import { Module } from '@nestjs/common';
import { AuthService } from 'src/services/auth.service';
import { AuthAbstract } from 'src/abstracts/auth.abstract';
import { AuthController } from 'src/controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';

import { UserModule } from './user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AuthAbstract,
      useClass: AuthService,
    },
  ],
  exports: [AuthAbstract, JwtModule],
})
export class AuthModule {}
