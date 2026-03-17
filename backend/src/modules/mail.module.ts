import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mail, MailSchema } from 'src/schemas/mail.schema';
import { EmailProcessor } from 'src/services/bullmq/processor/mail.processor';
import { MailService } from 'src/services/mail.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Mail.name, schema: MailSchema }]),
  ],
  controllers: [],
  providers: [MailService, EmailProcessor],
  exports: [MailService],
})
export class MailModule {}
