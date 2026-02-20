import { Module } from '@nestjs/common';
import { AuthService } from 'src/services/auth.service';
import { AuthAbstract } from 'src/abstracts/auth.abstract';
import { AuthController } from 'src/controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';

import { UserModule } from './user.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '30m' },
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
