import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { UserAbstract } from 'src/abstracts/user.abstract';
import { UserController } from 'src/controllers/user.controller';
import { UserRepository } from 'src/repositories/user.repositories';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UserService } from 'src/services/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY || 'dev_secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [UserController],
  providers: [
    UserRepository,
    UserService,
    {
      provide: UserAbstract,
      useClass: UserService,
    },
  ],
  exports: [UserAbstract, UserRepository],
})
export class UserModule {}
