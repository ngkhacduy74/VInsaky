import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { RabbitMQService } from 'src/configs/rabbitmq.config';

import { MailType } from 'src/schemas/mail.schema';
import { MailService } from 'src/services/mail.service';

@Injectable()
export class EmailConsumer implements OnModuleInit {
  constructor(
    private rabbit: RabbitMQService,
    private mailService: MailService,
  ) {}

  async onModuleInit() {
    const channel = this.rabbit.getChannel() || (await this.rabbit.connect());

    await channel.assertQueue('email_queue', { durable: true });

    channel.consume('email_queue', async (msg: amqp.Message | null) => {
      if (!msg) return;

      try {
        const data = JSON.parse(msg.content.toString());

        await this.mailService.sendMail(
          data.receiver,
          data.subject,
          data.content,
          data.type,
        );

        channel.ack(msg);
      } catch (error) {
        console.error('Email send failed:', error);
        channel.nack(msg, false, false);
      }
    });
  }
}
