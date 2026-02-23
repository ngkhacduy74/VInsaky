import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mail, MailSchema } from 'src/schemas/mail.schema';
import { MailService } from 'src/services/mail.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Mail.name, schema: MailSchema }]),
  ],
  controllers: [],
  providers: [
    MailService,
  ],
  exports: [MailService], 
})
export class MailModule {}
